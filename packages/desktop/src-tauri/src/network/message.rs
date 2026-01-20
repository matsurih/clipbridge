use serde::{Deserialize, Serialize};

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageType {
    ClipboardUpdate,
    DeviceHello,
    DeviceAck,
    DeviceGoodbye,
    Ping,
    Pong,
}

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkMessage {
    pub msg_type: MessageType,
    pub from: String,
    pub to: Option<Vec<String>>,
    pub payload: serde_json::Value,
    pub timestamp: u64,
    pub nonce: String,
}

impl NetworkMessage {
    #[allow(dead_code)]
    pub fn new(msg_type: MessageType, from: String, payload: serde_json::Value) -> Self {
        use std::time::{SystemTime, UNIX_EPOCH};

        Self {
            msg_type,
            from,
            to: None,
            payload,
            timestamp: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64,
            nonce: uuid::Uuid::new_v4().to_string(),
        }
    }

    #[allow(dead_code)]
    pub fn to_bytes(&self) -> Result<Vec<u8>, serde_json::Error> {
        serde_json::to_vec(self)
    }

    #[allow(dead_code)]
    pub fn from_bytes(bytes: &[u8]) -> Result<Self, serde_json::Error> {
        serde_json::from_slice(bytes)
    }
}

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClipboardData {
    pub id: String,
    pub content: String,
    pub timestamp: u64,
}

impl ClipboardData {
    #[allow(dead_code)]
    pub fn new(content: String) -> Self {
        use std::time::{SystemTime, UNIX_EPOCH};

        Self {
            id: uuid::Uuid::new_v4().to_string(),
            content,
            timestamp: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64,
        }
    }
}
