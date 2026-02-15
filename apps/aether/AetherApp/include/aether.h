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
    uint8_t style; // 0=Block, 1=Underline, 2=Bar
} AetherCursor;

void aether_set_cursor_style(AetherTerminal* term, uint8_t style);

// Lifecycle
AetherTerminal* aether_terminal_new(uint32_t rows, uint32_t cols);
void aether_terminal_free(AetherTerminal* term);

// I/O
int32_t aether_write_input(AetherTerminal* term, const uint8_t* data, size_t len);
int32_t aether_read_output(AetherTerminal* term, uint8_t* buffer, size_t len);

// Grid access
const AetherCell* aether_get_cell(const AetherTerminal* term, uint32_t row, uint32_t col);
bool aether_resize(AetherTerminal* term, uint32_t rows, uint32_t cols);

// State queries
AetherCursor aether_get_cursor(const AetherTerminal* term);
bool aether_is_dirty(const AetherTerminal* term);
void aether_mark_clean(AetherTerminal* term);

// Version
const char* aether_version(void);

#endif // AETHER_H
