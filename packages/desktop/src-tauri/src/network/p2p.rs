use super::message::{ClipboardData, MessageType, NetworkMessage};
use std::collections::HashMap;
use std::net::{SocketAddr, TcpListener, TcpStream};
use std::sync::Arc;
use parking_lot::Mutex;
use std::io::{Read, Write};
use std::thread;

const P2P_PORT: u16 = 7879;

pub type MessageCallback = Arc<dyn Fn(NetworkMessage) + Send + Sync>;

pub struct P2PNetwork {
    device_id: String,
    connections: Arc<Mutex<HashMap<String, TcpStream>>>,
    is_running: Arc<Mutex<bool>>,
    on_message: Option<MessageCallback>,
}

impl P2PNetwork {
    pub fn new(device_id: String) -> Self {
        Self {
            device_id,
            connections: Arc::new(Mutex::new(HashMap::new())),
            is_running: Arc::new(Mutex::new(false)),
            on_message: None,
        }
    }

    pub fn set_message_handler<F>(&mut self, callback: F)
    where
        F: Fn(NetworkMessage) + Send + Sync + 'static,
    {
        self.on_message = Some(Arc::new(callback));
    }

    /// Start the P2P network listener
    pub fn start(&self) -> std::io::Result<()> {
        let mut is_running = self.is_running.lock();
        if *is_running {
            return Ok(());
        }

        *is_running = true;

        let listener = TcpListener::bind(format!("0.0.0.0:{}", P2P_PORT))?;
        listener.set_nonblocking(true)?;

        let is_running_clone = Arc::clone(&self.is_running);
        let connections_clone = Arc::clone(&self.connections);
        let device_id_clone = self.device_id.clone();
        let on_message_clone = self.on_message.clone();

        thread::spawn(move || {
            log::info!("P2P listener started on port {}", P2P_PORT);

            while *is_running_clone.lock() {
                match listener.accept() {
                    Ok((stream, addr)) => {
                        log::info!("New P2P connection from {}", addr);
                        let connections = Arc::clone(&connections_clone);
                        let device_id = device_id_clone.clone();
                        let on_message = on_message_clone.clone();

                        thread::spawn(move || {
                            Self::handle_connection(stream, addr, connections, device_id, on_message);
                        });
                    }
                    Err(ref e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                        // No pending connections, sleep briefly
                        thread::sleep(std::time::Duration::from_millis(100));
                    }
                    Err(e) => {
                        log::error!("Error accepting connection: {}", e);
                    }
                }
            }

            log::info!("P2P listener stopped");
        });

        Ok(())
    }

    pub fn stop(&self) {
        let mut is_running = self.is_running.lock();
        *is_running = false;

        // Close all connections
        let mut connections = self.connections.lock();
        connections.clear();
    }

    /// Connect to a peer device
    pub fn connect_to_peer(&self, addr: SocketAddr) -> std::io::Result<()> {
        log::info!("Connecting to peer at {}", addr);

        match TcpStream::connect(addr) {
            Ok(mut stream) => {
                // Send hello message
                let hello_msg = NetworkMessage::new(
                    MessageType::DeviceHello,
                    self.device_id.clone(),
                    serde_json::json!({
                        "device_id": self.device_id,
                    }),
                );

                if let Ok(bytes) = hello_msg.to_bytes() {
                    let len = bytes.len() as u32;
                    stream.write_all(&len.to_be_bytes())?;
                    stream.write_all(&bytes)?;
                }

                log::info!("Connected to peer at {}", addr);
                Ok(())
            }
            Err(e) => {
                log::error!("Failed to connect to peer at {}: {}", addr, e);
                Err(e)
            }
        }
    }

    /// Broadcast clipboard data to all connected peers
    pub fn broadcast_clipboard(&self, content: String) -> std::io::Result<()> {
        let clipboard_data = ClipboardData::new(content);
        let message = NetworkMessage::new(
            MessageType::ClipboardUpdate,
            self.device_id.clone(),
            serde_json::to_value(&clipboard_data).unwrap(),
        );

        let bytes = message.to_bytes().map_err(|e| {
            std::io::Error::new(std::io::ErrorKind::Other, e)
        })?;

        let connections = self.connections.lock();
        for (peer_id, stream) in connections.iter() {
            if let Ok(mut stream) = stream.try_clone() {
                let len = bytes.len() as u32;
                if let Err(e) = stream.write_all(&len.to_be_bytes()) {
                    log::warn!("Failed to send length to {}: {}", peer_id, e);
                    continue;
                }
                if let Err(e) = stream.write_all(&bytes) {
                    log::warn!("Failed to send data to {}: {}", peer_id, e);
                }
            }
        }

        Ok(())
    }

    fn handle_connection(
        mut stream: TcpStream,
        addr: SocketAddr,
        connections: Arc<Mutex<HashMap<String, TcpStream>>>,
        _device_id: String,
        on_message: Option<MessageCallback>,
    ) {
        let mut len_buf = [0u8; 4];

        loop {
            // Read message length
            match stream.read_exact(&mut len_buf) {
                Ok(_) => {
                    let len = u32::from_be_bytes(len_buf) as usize;

                    if len > 10_000_000 { // 10MB max
                        log::warn!("Message too large: {} bytes", len);
                        break;
                    }

                    let mut buf = vec![0u8; len];
                    match stream.read_exact(&mut buf) {
                        Ok(_) => {
                            match NetworkMessage::from_bytes(&buf) {
                                Ok(msg) => {
                                    log::debug!("Received message from {}: {:?}", addr, msg.msg_type);

                                    // Handle device hello
                                    if matches!(msg.msg_type, MessageType::DeviceHello) {
                                        let peer_id = msg.from.clone();
                                        if let Ok(stream_clone) = stream.try_clone() {
                                            connections.lock().insert(peer_id.clone(), stream_clone);
                                            log::info!("Added peer connection: {}", peer_id);
                                        }
                                    }

                                    // Call message handler
                                    if let Some(ref callback) = on_message {
                                        callback(msg);
                                    }
                                }
                                Err(e) => {
                                    log::error!("Failed to parse message: {}", e);
                                    break;
                                }
                            }
                        }
                        Err(e) => {
                            log::debug!("Connection closed: {}", e);
                            break;
                        }
                    }
                }
                Err(e) => {
                    log::debug!("Connection closed: {}", e);
                    break;
                }
            }
        }
    }
}

impl Drop for P2PNetwork {
    fn drop(&mut self) {
        self.stop();
    }
}
