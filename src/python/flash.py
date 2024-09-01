import subprocess

def flash_esp32(pio_env, port):
    subprocess.run(
        ["platformio", "run", "-e", pio_env, "-t", "upload", "--upload-port", port]
    )


def flash_nrf52(pio_env, port):
    subprocess.run(
        ["platformio", "run", "-e", pio_env, "-t", "upload", "--upload-port", port]
    )
