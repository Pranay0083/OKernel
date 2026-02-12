# Hardware Cost Mapping (Machine Sympathy)
OPCODE_HARDWARE_MAP = {
    # MEMORY READ
    "LOAD_CONST": ("MEM_READ", 2),
    "LOAD_FAST": ("MEM_READ", 2),
    "LOAD_NAME": ("MEM_READ", 4),
    "LOAD_GLOBAL": ("MEM_READ", 4),
    "LOAD_ATTR": ("MEM_READ", 4),
    "LOAD_METHOD": ("MEM_READ", 3),
    "BINARY_SUBSCR": ("MEM_READ", 4),
    # MEMORY WRITE
    "STORE_FAST": ("MEM_WRITE", 2),
    "STORE_NAME": ("MEM_WRITE", 4),
    "STORE_ATTR": ("MEM_WRITE", 4),
    "STORE_SUBSCR": ("MEM_WRITE", 4),
    "DELETE_FAST": ("MEM_WRITE", 1),
    # ALU (COMPUTE)
    "BINARY_ADD": ("ALU", 1),
    "BINARY_SUBTRACT": ("ALU", 1),
    "BINARY_MULTIPLY": ("ALU", 3),
    "BINARY_TRUE_DIVIDE": ("ALU", 5),
    "BINARY_FLOOR_DIVIDE": ("ALU", 5),
    "BINARY_MODULO": ("ALU", 5),
    "BINARY_POWER": ("ALU", 10),
    "BINARY_OR": ("ALU", 1),
    "BINARY_XOR": ("ALU", 1),
    "BINARY_AND": ("ALU", 1),
    "INPLACE_ADD": ("ALU", 1),
    "INPLACE_SUBTRACT": ("ALU", 1),
    # CONTROL FLOW
    "COMPARE_OP": ("CONTROL", 2),
    "JUMP_FORWARD": ("CONTROL", 1),
    "JUMP_ABSOLUTE": ("CONTROL", 1),
    "POP_JUMP_IF_TRUE": ("CONTROL", 2),
    "POP_JUMP_IF_FALSE": ("CONTROL", 2),
    "FOR_ITER": ("CONTROL", 3),
    "RETURN_VALUE": ("CONTROL", 2),
    # STACK / FUNCTION
    "POP_TOP": ("STACK", 1),
    "ROT_TWO": ("STACK", 1),
    "DUP_TOP": ("STACK", 1),
    "CALL_FUNCTION": ("FUNCTION", 10),
    "CALL_METHOD": ("FUNCTION", 8),
}


def get_hardware_info(opname: str) -> tuple[str, int]:
    """
    Map Python opcode to abstract hardware cost category.
    Returns (type_string, cost_int).
    """
    # Default fallback
    if opname in OPCODE_HARDWARE_MAP:
        return OPCODE_HARDWARE_MAP[opname]

    # Heuristics
    if "LOAD" in opname:
        return ("MEM_READ", 3)
    if "STORE" in opname:
        return ("MEM_WRITE", 3)
    if "BINARY" in opname or "INPLACE" in opname:
        return ("ALU", 2)
    if "JUMP" in opname or "IF" in opname:
        return ("CONTROL", 2)
    if "CALL" in opname:
        return ("FUNCTION", 8)

    return ("OTHER", 1)
