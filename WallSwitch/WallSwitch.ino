/*
  WallSwitch

  Using rc-switch Library

  https://github.com/sui77/rc-switch

*/

#include <RCSwitch.h>

const int kINT = 0;   // Receiver on inerrupt 0 => that is pin #4
const int kRELAY = 3; // Relay Output, active low
const int kSWITCH = 4; // Switch Input, active high

// Code 3 byte 
// 1 byte - thing
//          0x01 = Wall switch
// 
// 1 byte - thing ID
//
// 1 byte - action
//          0x00 = off
//          0x01 = on
const int kWALL_SWITCH = 0x010100;
const int kWALL_SWITCH_ON = 0x01;
const int kWALL_SWITCH_OFF = 0x02;
const int kACTION_MASK = 0xff;
          
RCSwitch wallSwitch = RCSwitch();
int prevValue = (kWALL_SWITCH | kWALL_SWITCH_OFF);
int switchState = 0;

void setup() {
  Serial.begin(9600);
  pinMode(kSWITCH, INPUT);
  pinMode(kRELAY, OUTPUT);
  digitalWrite(kRELAY, HIGH);
  wallSwitch.enableReceive(kINT);  

  switchState = digitalRead(kSWITCH);

  Serial.print("Start WallSwitch, switchState = ");
  Serial.println(switchState);
}

void printReceived(int value) {
    if (value == 0) {
      Serial.println("Unknown encoding");
    } else {
      Serial.print("Received ");
      Serial.print(wallSwitch.getReceivedValue());
      Serial.print(" / ");
      Serial.print(wallSwitch.getReceivedBitlength());
      Serial.print("bit ");
      Serial.print("Protocol: ");
      Serial.println(wallSwitch.getReceivedProtocol());
    }
}

void setValue(int value) {
    if (value != 0 && prevValue != value) {
        if (value == (kWALL_SWITCH | kWALL_SWITCH_ON)) {
          Serial.println("WallSwitch ON");
          digitalWrite(kRELAY, LOW);
        } else if (value == (kWALL_SWITCH | kWALL_SWITCH_OFF)) {
          Serial.println("WallSwitch OFF");
          digitalWrite(kRELAY, HIGH);
        }
        prevValue = value;
    }
}

void setWallSwitchOn(bool on) {
  if (on) {
    setValue(kWALL_SWITCH | kWALL_SWITCH_ON);
  } else {
    setValue(kWALL_SWITCH | kWALL_SWITCH_OFF);
  }
}

void loop() {
  // rc switch
  if (wallSwitch.available()) {
    int value = wallSwitch.getReceivedValue();
    printReceived(value);
    setValue(value);
    wallSwitch.resetAvailable();
  }

  // toggle switch
  int sw = digitalRead(kSWITCH);
  if (sw != switchState)  {
    switchState = sw;
    Serial.print("Switch Changed :");
    Serial.println(sw);
    if (prevValue == (kWALL_SWITCH | kWALL_SWITCH_ON)) {
      setWallSwitchOn(false);
    } else {
      setWallSwitchOn(true);
    }
    
    delay(1);
  }
}
