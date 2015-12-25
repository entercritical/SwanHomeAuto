/*

LED D13

HC-06 Bluetooth module
VCC - VCC
GND - GND
RX  - D9
TX  - D8

DHT-11 Temperature/Humidity Sensor
DATA - D2

Electric blanket 
Left D10
Right D11

 */
#include <SoftwareSerial.h>

SoftwareSerial bluetooth(8, 9); // RX, TX

#define EB_LEFT 10
#define EB_RIGHT 11

void setup() {
  // Open serial communications and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }

  pinMode(13, OUTPUT); //TEST
  pinMode(EB_LEFT, OUTPUT);
  pinMode(EB_RIGHT, OUTPUT);
  
  Serial.println("Goodnight moon!");

  // set the data rate for the SoftwareSerial port
  bluetooth.begin(9600);
  bluetooth.println("Hello, world?");
}

void loop() { // run over and over
  if (bluetooth.available()) {
    char c = bluetooth.read();
    
    Serial.write(c);
    if (c == '0') {
      digitalWrite(13, LOW);
      digitalWrite(EB_LEFT, LOW);
      digitalWrite(EB_RIGHT, LOW);
    } else if (c == '1') {
      digitalWrite(13, HIGH);
    } else if (c == '2') {
      digitalWrite(EB_LEFT, LOW);
    } else if (c == '3') {
      digitalWrite(EB_LEFT, HIGH);
    } else if (c == '4') {
      digitalWrite(EB_RIGHT, LOW);
    } else if (c == '5') {
      digitalWrite(EB_RIGHT, HIGH);
    }
  }
  if (Serial.available()) {
    bluetooth.write(Serial.read());
  }
}

