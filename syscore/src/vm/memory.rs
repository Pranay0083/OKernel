use serde::{Deserialize, Serialize};

pub const SIZE: usize = 1024 * 1024; // 1MB RAM
pub const HEAP_BASE: usize = 0x5000;
pub const STACK_TOP: usize = 0xFFFFF;

pub fn default_buffer() -> Vec<u8> {
    vec![0; SIZE]
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Memory {
    #[serde(skip, default = "default_buffer")]
    pub buffer: Vec<u8>,
    pub heap_ptr: usize,
}

impl Default for Memory {
    fn default() -> Self {
        Self::new()
    }
}

impl Memory {
    pub fn new() -> Self {
        Self {
            buffer: vec![0; SIZE],
            heap_ptr: HEAP_BASE,
        }
    }

    pub fn reset(&mut self) {
        self.buffer.fill(0);
        self.heap_ptr = HEAP_BASE;
    }

    #[allow(dead_code)]
    pub fn read8(&self, addr: usize) -> u8 {
        self.buffer.get(addr).cloned().unwrap_or(0)
    }

    pub fn write8(&mut self, addr: usize, val: u8) {
        if addr < SIZE {
            self.buffer[addr] = val;
        }
    }

    #[allow(dead_code)]
    pub fn read32(&self, addr: usize) -> i32 {
        if addr + 4 <= SIZE {
            i32::from_le_bytes([
                self.buffer[addr],
                self.buffer[addr + 1],
                self.buffer[addr + 2],
                self.buffer[addr + 3],
            ])
        } else {
            0
        }
    }

    pub fn write32(&mut self, addr: usize, val: i32) {
        if addr + 4 <= SIZE {
            let bytes = val.to_le_bytes();
            self.buffer[addr..addr + 4].copy_from_slice(&bytes);
        }
    }

    pub fn write_string(&mut self, addr: usize, s: &str) {
        let bytes = s.as_bytes();
        for (i, &byte) in bytes.iter().enumerate() {
            self.write8(addr + i, byte);
        }
        self.write8(addr + bytes.len(), 0); // Null terminator
    }

    #[allow(dead_code)]
    pub fn read_string(&self, addr: usize) -> String {
        let mut s = String::new();
        let mut ptr = addr;
        while ptr < SIZE {
            let byte = self.read8(ptr);
            if byte == 0 {
                break;
            }
            s.push(byte as char);
            ptr += 1;
            if ptr - addr > 1000 {
                break;
            }
        }
        s
    }

    pub fn malloc(&mut self, size: usize) -> Result<usize, String> {
        let ptr = self.heap_ptr;
        self.heap_ptr += size;
        if self.heap_ptr >= STACK_TOP {
            return Err("Out of Memory (Heap Collision)".to_string());
        }
        Ok(ptr)
    }

    #[allow(dead_code)]
    pub fn get_usage(&self) -> usize {
        self.heap_ptr - HEAP_BASE
    }
}
