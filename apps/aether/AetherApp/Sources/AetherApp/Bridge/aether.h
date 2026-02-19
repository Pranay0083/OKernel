#ifndef AETHER_H
#define AETHER_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

// Opaque terminal handle
typedef struct AetherTerminal AetherTerminal;

// Cell structure (must match Zig)
typedef struct {
    uint32_t codepoint;
    uint32_t fg_color;
    uint32_t bg_color;
    uint16_t flags;
    uint16_t semantic_id;
} AetherCell;

// Cursor position
typedef struct {
    uint32_t row;
    uint32_t col;
    bool visible;
    uint8_t style; // 0=block, 1=underline, 2=bar
} AetherCursor;

void aether_set_cursor_style(AetherTerminal* term, uint8_t style);

// Callback types
typedef void (*AetherTitleCallback)(const uint8_t* data, size_t len);
typedef void (*AetherClipboardSetCallback)(const uint8_t* data, size_t len);
typedef const char* (*AetherClipboardGetCallback)(void);

// Callback registration (call before using terminal)
void aether_set_title_callback(AetherTitleCallback cb);
void aether_set_clipboard_callback(AetherClipboardSetCallback cb);
void aether_set_get_clipboard_callback(AetherClipboardGetCallback cb);

// Lifecycle
AetherTerminal* aether_terminal_new(uint32_t rows, uint32_t cols);
AetherTerminal* aether_terminal_with_pty(uint32_t rows, uint32_t cols, const char* shell, const char* cwd, bool ctrlc_sends_sigint);
void aether_terminal_free(AetherTerminal* term);

// I/O
int32_t aether_write_input(AetherTerminal* term, const uint8_t* data, size_t len);
void aether_process_output(AetherTerminal* term);

// Grid access
const AetherCell* aether_get_cell(const AetherTerminal* term, uint32_t row, uint32_t col);
bool aether_resize(AetherTerminal* term, uint32_t rows, uint32_t cols);

// Scrolling
typedef struct {
    uint32_t total_rows;
    uint32_t visible_rows;
    uint32_t scrollback_rows;
    uint32_t viewport_offset;
} AetherScrollInfo;

void aether_scroll_view(AetherTerminal* term, int32_t delta);
void aether_scroll_to(AetherTerminal* term, uint32_t offset);
void aether_scroll_to_bottom(AetherTerminal* term);
AetherScrollInfo aether_get_scroll_info(AetherTerminal* term);

// Selection
void aether_selection_start(AetherTerminal* term, uint32_t row, uint32_t col);
void aether_selection_drag(AetherTerminal* term, uint32_t row, uint32_t col);
void aether_selection_end(AetherTerminal* term, uint32_t row, uint32_t col);
void aether_selection_clear(AetherTerminal* term);
bool aether_selection_is_active(AetherTerminal* term);
bool aether_selection_contains(AetherTerminal* term, uint32_t row, uint32_t col);
char* aether_get_selection(AetherTerminal* term);
void aether_free_string(char* str);

// Mouse
bool aether_mouse_event(AetherTerminal* term, uint8_t button, bool pressed, uint32_t row, uint32_t col, bool dragging);

AetherCursor aether_get_cursor(const AetherTerminal* term);
bool aether_is_dirty(const AetherTerminal* term);
void aether_mark_clean(AetherTerminal* term);

// Queue
int32_t aether_get_pid(const AetherTerminal* term);
size_t aether_get_tty(const AetherTerminal* term, char* buf, size_t len);
size_t aether_get_cwd(int32_t pid, char* buf, size_t len);
uint32_t aether_get_cols(const AetherTerminal* term);
uint32_t aether_get_rows(const AetherTerminal* term);

// History
typedef struct {
    bool wrapped;
    bool semantic_prompt;
} AetherRowMetadata;

uint32_t aether_terminal_get_history_count(const AetherTerminal* term);
bool aether_terminal_get_history_row(const AetherTerminal* term, uint32_t idx, AetherCell* cells);
AetherRowMetadata aether_terminal_get_row_metadata(const AetherTerminal* term, uint32_t idx);
void aether_terminal_clear_history(AetherTerminal* term);
bool aether_terminal_append_history_row(AetherTerminal* term, const AetherCell* cells, uint32_t cells_len, bool wrapped, bool semantic_prompt);

// Version
const char* aether_version(void);

#endif // AETHER_H
