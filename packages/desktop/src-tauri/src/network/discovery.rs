use std::net::{SocketAddr, UdpSocket};
use std::sync::Arc;
use parking_lot::Mutex;
use std::thread;
use std::time::Duration;

const DISCOVERY_PORT: u16 = 7878;
const DISCOVERY_MULTICAST_ADDR: &str = "239.255.77.77";
const DISCOVERY_MESSAGE: &str = "CLIPBRIDGE_DISCOVERY";

#[derive(Debug, Clone)]
pub struct DiscoveredDevice {
    pub device_id: String,
    pub addr: SocketAddr,
    pub last_seen: u64,
}

pub struct DeviceDiscovery {
    device_id: String,
    discovered_devices: Arc<Mutex<Vec<DiscoveredDevice>>>,
    is_running: Arc<Mutex<bool>>,
}

impl DeviceDiscovery {
    pub fn new(device_id: String) -> Self {
        Self {
            device_id,
            discovered_devices: Arc::new(Mutex::new(Vec::new())),
            is_running: Arc::new(Mutex::new(false)),
        }
    }

    /// Start broadcasting and listening for devices
    pub fn start(&self) -> std::io::Result<()> {
        let mut is_running = self.is_running.lock();
        if *is_running {
            return Ok(());
        }

        *is_running = true;

        // Start broadcaster
        let device_id_clone = self.device_id.clone();
        let is_running_clone = Arc::clone(&self.is_running);
        thread::spawn(move || {
            Self::broadcast_presence(&device_id_clone, &is_running_clone);
        });

        // Start listener
        let discovered_devices_clone = Arc::clone(&self.discovered_devices);
        let is_running_clone = Arc::clone(&self.is_running);
        let device_id_clone = self.device_id.clone();
        thread::spawn(move || {
            Self::listen_for_devices(&device_id_clone, &discovered_devices_clone, &is_running_clone);
        });

        log::info!("Device discovery started");
        Ok(())
    }

    pub fn stop(&self) {
        let mut is_running = self.is_running.lock();
        *is_running = false;
        log::info!("Device discovery stopped");
    }

    pub fn get_discovered_devices(&self) -> Vec<DiscoveredDevice> {
        self.discovered_devices.lock().clone()
    }

    fn broadcast_presence(device_id: &str, is_running: &Arc<Mutex<bool>>) {
        let socket = match UdpSocket::bind("0.0.0.0:0") {
            Ok(s) => s,
            Err(e) => {
                log::error!("Failed to bind UDP socket for broadcasting: {}", e);
                return;
            }
        };

        if let Err(e) = socket.set_broadcast(true) {
            log::error!("Failed to set broadcast mode: {}", e);
            return;
        }

        let broadcast_addr = format!("{}:{}", DISCOVERY_MULTICAST_ADDR, DISCOVERY_PORT);
        let message = format!("{}:{}", DISCOVERY_MESSAGE, device_id);

        while *is_running.lock() {
            if let Err(e) = socket.send_to(message.as_bytes(), &broadcast_addr) {
                log::warn!("Failed to send discovery broadcast: {}", e);
            } else {
                log::debug!("Sent discovery broadcast");
            }

            thread::sleep(Duration::from_secs(5));
        }
    }

    fn listen_for_devices(
        own_device_id: &str,
        discovered_devices: &Arc<Mutex<Vec<DiscoveredDevice>>>,
        is_running: &Arc<Mutex<bool>>,
    ) {
        let socket = match UdpSocket::bind(format!("0.0.0.0:{}", DISCOVERY_PORT)) {
            Ok(s) => s,
            Err(e) => {
                log::error!("Failed to bind UDP socket for listening: {}", e);
                return;
            }
        };

        if let Err(e) = socket.set_read_timeout(Some(Duration::from_secs(1))) {
            log::error!("Failed to set read timeout: {}", e);
            return;
        }

        let mut buf = [0u8; 1024];

        while *is_running.lock() {
            match socket.recv_from(&mut buf) {
                Ok((len, addr)) => {
                    let message = String::from_utf8_lossy(&buf[..len]);
                    if let Some(device_id) = message.strip_prefix(&format!("{}:", DISCOVERY_MESSAGE)) {
                        let device_id = device_id.to_string();

                        // Ignore own broadcasts
                        if device_id == own_device_id {
                            continue;
                        }

                        log::debug!("Discovered device: {} at {}", device_id, addr);

                        let mut devices = discovered_devices.lock();
                        let now = std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap()
                            .as_secs();

                        if let Some(device) = devices.iter_mut().find(|d| d.device_id == device_id) {
                            device.last_seen = now;
                            device.addr = addr;
                        } else {
                            devices.push(DiscoveredDevice {
                                device_id,
                                addr,
                                last_seen: now,
                            });
                        }

                        // Remove stale devices (not seen for 30 seconds)
                        devices.retain(|d| now - d.last_seen < 30);
                    }
                }
                Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                    // Timeout, continue
                }
                Err(e) => {
                    log::warn!("Error receiving discovery message: {}", e);
                }
            }
        }
    }
}

impl Drop for DeviceDiscovery {
    fn drop(&mut self) {
        self.stop();
    }
}
