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
#include "DHT.h"

// configuration
#define EB_LEFT 10
#define EB_RIGHT 11

#define DHTTYPE DHT11
#define DHTPIN 2

SoftwareSerial bluetooth(8, 9); // RX, TX
DHT dht(DHTPIN, DHTTYPE);

unsigned long time;
unsigned long lastUpdateTime;

void setup() {
  // Open serial communications and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }

  pinMode(13, OUTPUT); //TEST
  pinMode(EB_LEFT, OUTPUT);
  pinMode(EB_RIGHT, OUTPUT);

  // set the data rate for the SoftwareSerial port
  bluetooth.begin(9600);

  dht.begin();
  updateDHT();
  lastUpdateTime = time = millis();
}

void updateDHT() {
    int t = dht.readTemperature();
    int h = dht.readHumidity();
    Serial.print("\nHumidity: ");
    Serial.print(h);
    Serial.print(" %\t");
    Serial.print("Temperature: ");
    Serial.print(t);
    Serial.println(" *C ");
    bluetooth.write(0x02); // start
    bluetooth.write('T');
    bluetooth.write(t);
    bluetooth.write(h);
    bluetooth.write(0x03); // end
}
void loop() { // run over and over
  time = millis();
  if (time - lastUpdateTime > 1000L * 60 * 10) {
    lastUpdateTime = time;
    updateDHT();
  }
  
  if (bluetooth.available()) {
    int c = bluetooth.read();
    
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
    } else if (c == '6') {
      updateDHT();
    }
  }
  
  if (Serial.available()) {
    bluetooth.write(Serial.read());
  }
}

