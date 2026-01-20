pub mod discovery;
pub mod message;
pub mod p2p;

// Re-exports for public API
#[allow(unused_imports)]
pub use discovery::DeviceDiscovery;
#[allow(unused_imports)]
pub use message::{MessageType, NetworkMessage};
#[allow(unused_imports)]
pub use p2p::P2PNetwork;
