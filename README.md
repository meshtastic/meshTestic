# README

### End-to-End Tests

End-to-end tests simulate real-world usage and test the common behavior flows in the device firmware from start to finish. These tests validate the system's behavior based on feedback through the device API level connections. 

## Running the Tests

To run the tests, follow these steps:

1. Ensure that node / pnpm and python-pip along with the meshtastic python package and platform-io are installed.
2. Ensure that supported (devices)[devices.json] are connected via USB.
3. Open a terminal in the project directory
4. Run the command `pnpm i` to install dependencies.
5. Run the command `pnpm run test` to install dependencies 

The test suite will then be executed, and the results will be displayed in the terminal or command prompt.

