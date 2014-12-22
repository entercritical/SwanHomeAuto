/*
  Simple example for receiving
  
  http://code.google.com/p/rc-switch/
*/

#include <RCSwitch.h>

const int PIN_SWITCH = 4;    // Relay Switch
const int PIN_TOGGLE_BUTTON = 13;
const int BOILER_ON = 1001;  // Boiler ON code
const int BOILER_OFF = 1000; // Boiler OFF code  

RCSwitch mySwitch = RCSwitch();
boolean isBoilerOn = false;
int prevButtonState = 1;

void setBoilerOn(boolean on) {
  if (on == isBoilerOn) {
    Serial.print("isBoilerOn : ");
    Serial.println(isBoilerOn);
    return;
  }
  
  isBoilerOn = on;
  if (on) {
    Serial.println("Set Boiler ON");
    digitalWrite(PIN_SWITCH, HIGH);
  } else {
    Serial.println("Set Boiler OFF");
    digitalWrite(PIN_SWITCH, LOW);
  }
}

void setup() {
  Serial.begin(9600);
  
  // Receiver on interrupt 0 => that is pin #2 (Uno)
  // Leonardo, Micro pin #3
  mySwitch.enableReceive(0);  
  
  pinMode(PIN_SWITCH, OUTPUT);
  digitalWrite(PIN_SWITCH, LOW);
  pinMode(PIN_TOGGLE_BUTTON, INPUT);
}

void loop() {
  int buttonState = digitalRead(PIN_TOGGLE_BUTTON);
  if (buttonState == 0 && prevButtonState != buttonState) {
      setBoilerOn(!isBoilerOn);
  }
  prevButtonState = buttonState;
  
  if (mySwitch.available()) {
    
    int value = mySwitch.getReceivedValue();
    
    if (value == 0) {
      Serial.print("Unknown encoding");
    } else {
      Serial.print("Received ");
      Serial.print( mySwitch.getReceivedValue() );
      Serial.print(" / ");
      Serial.print( mySwitch.getReceivedBitlength() );
      Serial.print("bit ");
      Serial.print("Protocol: ");
      Serial.println( mySwitch.getReceivedProtocol() );
      
      if (value == BOILER_ON) {
        setBoilerOn(true);
      } else if (value == BOILER_OFF) {
        setBoilerOn(false);
      }
    }

    mySwitch.resetAvailable();
  }
}
