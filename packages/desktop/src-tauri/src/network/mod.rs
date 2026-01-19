pub mod p2p;
pub mod discovery;
pub mod message;

// Re-exports for public API
#[allow(unused_imports)]
pub use p2p::P2PNetwork;
#[allow(unused_imports)]
pub use discovery::DeviceDiscovery;
#[allow(unused_imports)]
pub use message::{NetworkMessage, MessageType};
