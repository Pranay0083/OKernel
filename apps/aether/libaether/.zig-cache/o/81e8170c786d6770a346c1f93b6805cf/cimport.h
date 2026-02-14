#define _DARWIN_C_SOURCE 1
#include <pty.h>
#include <sys/ioctl.h>
#include <signal.h>
#include <spawn.h>
#include <termios.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <stdlib.h>
