use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "lowercase")]
pub enum NodeType {
    File,
    Dir,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FileNode {
    pub name: String,
    #[serde(rename = "type")]
    pub node_type: NodeType,
    pub content: Option<String>,
    pub children: Option<HashMap<String, FileNode>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MockFileSystem {
    pub root: FileNode,
}

impl MockFileSystem {
    pub fn new() -> Self {
        let mut home_children = HashMap::new();
        let mut user_children = HashMap::new();

        user_children.insert(
            "README.txt".to_string(),
            FileNode {
                name: "README.txt".to_string(),
                node_type: NodeType::File,
                content: Some("Welcome to SysCore!".to_string()),
                children: None,
            },
        );

        user_children.insert(
            "secret.c".to_string(),
            FileNode {
                name: "secret.c".to_string(),
                node_type: NodeType::File,
                content: Some("void main() { ... }".to_string()),
                children: None,
            },
        );

        home_children.insert(
            "user".to_string(),
            FileNode {
                name: "user".to_string(),
                node_type: NodeType::Dir,
                content: None,
                children: Some(user_children),
            },
        );

        let mut bin_children = HashMap::new();
        bin_children.insert(
            "ls".to_string(),
            FileNode {
                name: "ls".to_string(),
                node_type: NodeType::File,
                content: None,
                children: None,
            },
        );
        bin_children.insert(
            "sh".to_string(),
            FileNode {
                name: "sh".to_string(),
                node_type: NodeType::File,
                content: None,
                children: None,
            },
        );

        let mut root_children = HashMap::new();
        root_children.insert(
            "home".to_string(),
            FileNode {
                name: "home".to_string(),
                node_type: NodeType::Dir,
                content: None,
                children: Some(home_children),
            },
        );
        root_children.insert(
            "bin".to_string(),
            FileNode {
                name: "bin".to_string(),
                node_type: NodeType::Dir,
                content: None,
                children: Some(bin_children),
            },
        );

        Self {
            root: FileNode {
                name: "root".to_string(),
                node_type: NodeType::Dir,
                content: None,
                children: Some(root_children),
            },
        }
    }

    pub fn list_files(&self) -> Vec<String> {
        if let Some(root_children) = &self.root.children {
            if let Some(home) = root_children.get("home") {
                if let Some(home_children) = &home.children {
                    if let Some(user) = home_children.get("user") {
                        if let Some(user_children) = &user.children {
                            return user_children.keys().cloned().collect();
                        }
                    }
                }
            }
        }
        vec![]
    }

    pub fn create_file(&mut self, name: String) {
        if let Some(root_children) = &mut self.root.children {
            if let Some(home) = root_children.get_mut("home") {
                if let Some(home_children) = &mut home.children {
                    if let Some(user) = home_children.get_mut("user") {
                        if let Some(user_children) = &mut user.children {
                            user_children.insert(
                                name.clone(),
                                FileNode {
                                    name,
                                    node_type: NodeType::File,
                                    content: Some("".to_string()),
                                    children: None,
                                },
                            );
                        }
                    }
                }
            }
        }
    }
}
