#include <Keyboard.h>

int pareKey(String name) {
  if (name == "CTRL") return KEY_LEFT_CTRL;
  else if (name == "ALT") return KEY_LEFT_ALT;
  else if (name == "SHIFT") return KEY_LEFT_SHIFT;
  else if (name == "META") return KEY_LEFT_GUI;
  else if (name == "ESC") return KEY_ESC;
  else if (name == "TAB") return KEY_TAB;
  else if (name == "SPACE") return -1;
  else if (name == "PIPE") return -2;
  else if (name == "HOME") return KEY_HOME;
  else if (name == "END") return KEY_END;
  else if (name == "UP") return KEY_UP_ARROW;
  else if (name == "DOWN") return KEY_DOWN_ARROW;
  else if (name == "LEFT") return KEY_LEFT_ARROW;
  else if (name == "RIGHT") return KEY_RIGHT_ARROW;
  else if (name == "RETURN") return KEY_RETURN;
  else if (name == "BACKSPACE") return KEY_BACKSPACE;
  else if (name == "DELETE") return KEY_DELETE;
  else return 0;
}

void sendText(String text) {
  for (int i = 0; i < text.length(); i++) {
    Keyboard.write(text[i]);
  }

  Serial1.print("T");
  Serial1.println(text);
}

void pressKey(String name) {
  int key = pareKey(name);
  
  if (key == 0) {
    Serial1.print("NP");
    Serial1.println(name);
  } else if (key == -1) {
    Keyboard.write(" ");
  } else if (key == -2) {
    Keyboard.write("|");
  } else{
    Keyboard.press(key);
  }

  Serial1.print("P");
  Serial1.println(name);
}

void releaseKey(String name) {
  int key = pareKey(name);
  
  if (key < 1) {
    Serial1.print("NR");
    Serial1.println(name);
  } else{
    Keyboard.release(key);
  }

  Serial1.print("R");
  Serial1.println(name);
}


void setup() {
  Serial1.begin(9600);
  Keyboard.begin();
}

void loop() {
  if (Serial1.available() > 0) {
    char action = Serial1.read();

    if (action == 'P' || action == 'R') {
      delay(10);
    } else {
      delay(200);
    }

    String data = "";

    char c;
    while (Serial1.available() > 0) {
      c = (char) Serial1.read();
      if (c == '\n') break;
      data += c;
    }

    if (action == 'P') pressKey(data);
    else if (action == 'R') releaseKey(data);
    else if (action == 'T') sendText(data);
    else Serial1.println("ID"); // Invalid data
  }
}