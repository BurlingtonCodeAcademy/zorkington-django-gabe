//multiple slices you already have
//inventory should bring up inventory
//order that thingy pizza
//clean up ifs

const readline = require("readline");
const readlineInterface = readline.createInterface(
  process.stdin,
  process.stdout
);

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });
}

const mainStMessage = `182 Main St. You are standing on Main Street between Church and South Winooski.
  There is a door here. A keypad sits on the handle. On the door is a handwritten sign.`;
const foyerMessage = `You are in a foyer. Or maybe it's an antechamber. Or a vestibule.
  Or an entryway. Or an atrium. Or a narthex. But let's forget all that fancy flatlander vocabulary,
  and just call it a foyer. In Vermont, this is pronounced "FO-ee-yurr".
  A copy of Seven Days lies in a corner. There is a door to a bathroom and a door to the classroom.`;
const classroomMessage = `You are in the classroom. Class is about to begin. You look around to find a seat, and see a chair with optimal lumbar support. A sign reads "Bathroom code: 0202"`;
const bathroomMessage =
  "It is not the cleanest bathroom but it will suffice. There just so happens to be a shower.";
const mrMikesMessage = `The pizza smells delicious. You walk to the front counter.`;
const sevenDaysArticle = `The paper reads: GEMINI (May 21-June 20): In the 1960s, Gemini musician Brian Wilson began writing and recording best-selling songs with his band the Beach Boys. 
A seminal moment in his development happened while he was listening to his car radio in August 1963. A tune he had never heard before came on: "Be My Baby" by the Ronettes. 
Wilson was so excited he pulled over onto the shoulder of the road and stopped driving so he could devote his full attention to what he considered a shockingly beautiful work of art. 
"I started analyzing all the guitars, pianos, bass, drums and percussion," he told the New York Times. "Once I got all those learned, I knew how to produce records." 
I suspect a pivotal moment like this could unfold for you in the coming weeks, Gemini. Be alert!`;
const hungryMessage =
  "You take a seat in your optimal chair. Nice.\nClass happens and some facts and things enter your brain. Now, however, you are quite hungry. In fact, you find that you are so hungry that you just might die if you don't get some pizza within the next 7 things that you do.\nJosh recommends Mr. Mike's Pizza, outside on Main St.";

let locations = {
  "182 Main St": {
    canChangeTo: ["Foyer", "Mr. Mike's"],
    hasBeen: 1,
    welcomeMessage: mainStMessage
  },
  Foyer: {
    canChangeTo: ["182 Main St", "Classroom", "Bathroom"],
    inventory: ["seven days"],
    hasBeen: 0,
    welcomeMessage: foyerMessage
  },
  Classroom: {
    canChangeTo: ["Foyer"],
    hasBeen: 0,
    welcomeMessage: classroomMessage
  },
  Bathroom: {
    canChangeTo: ["Foyer", "Shower"],
    hasBeen: 0,
    welcomeMessage: bathroomMessage
  },
  Shower: { canChangeTo: ["Bathroom"] },
  "Mr. Mike's": {
    canChangeTo: ["182 Main St"],
    inventory: [],
    hasBeen: 0,
    welcomeMessage: mrMikesMessage
  }
};

let states = {
  Normal: { canChangeTo: ["ON FIRE!!!", "Hungry", "Full", "Enlightened"] },
  Hungry: { canChangeTo: ["ON FIRE!!!", "Full", "DEAD!", "Enlightened"] },
  Full: { canChangeTo: ["ON FIRE!!!", "Normal", "Enlightened"] },
  "ON FIRE!!!": { canChangeTo: ["Normal", "Hungry", "DEAD!", "Enlightened"] },
  Enlightened: { canChangeTo: [] },
  Dead: { canChangeTo: [] }
};

let currentState = "Normal";
let currentLocation = "182 Main St";
let hp = 100;
let inventory = [];
let theifStatus = 0;
let bladderStatus = 1;
let showerStatus = 0;
let hungryTurnsLeft = 8;

function enterRoom(newRoom) {
  let validTransitions = locations[currentLocation].canChangeTo;
  if (validTransitions.includes(newRoom)) {
    currentLocation = newRoom;
  } else {
    throw "Invalid location transition attempted - from " +
      currentLocation +
      " to " +
      newRoom;
  }
}

function enterState(newState) {
  let validTransitions = states[currentState].canChangeTo;
  if (validTransitions.includes(newState)) {
    currentState = newState;
  } else {
    throw "Invalid location transition attempted - from " +
      currentState +
      " to " +
      newState;
  }
}

function drop(item, invent = inventory) {
  for (i in invent) {
    if (invent[i] === item) {
      invent.splice(i, 1);
      break;
    }
  }
}

function fancify(words) {
  if (words === "seven days") {
    return "A copy of Seven Days";
  } else if (words === "pizza") {
    return "A slice of pizza";
  } else {
    return words;
  }
}

function simplifyString(string) {
  string = string.toLowerCase();
  stringArray0 = string.split("");
  for (charIndex in stringArray0) {
    if (stringArray0[charIndex] === `'` || stringArray0[charIndex] === `.`) {
      stringArray0 = stringArray0.splice(charIndex, 1);
    }
  }
  string = stringArray0.join("");
  stringArray1 = string.split(" ");
  for (wordIndex in stringArray1) {
    if (
      stringArray1[wordIndex] === "the" ||
      stringArray1[wordIndex] === "in" ||
      stringArray1[wordIndex] === "into"
    ) {
      stringArray1 = stringArray1.splice(wordIndex, 1);
    }
  }
  return stringArray1.join(" ");
}

function respond(answer) {
  let turnTaken = 1; //for fire damage and hunger. by default we assume that the player response costs a turn and deals damage
  if (
    simplifyString(answer) === "i" ||
    simplifyString(answer) === "display inventory" ||
    simplifyString(answer) === "take inventory"
  ) {
    if (inventory.length === 0) {
      console.log("You aren't carrying anything.");
    } else {
      let fancyInventory = [];
      for (item of inventory) {
        fancyInventory.push(fancify(item));
      }
      console.log("You are carrying:\n" + fancyInventory.join(", "));
    }
    turnTaken = 0;
  } else if (simplifyString(answer).startsWith("drop")) {
    let item = answer.slice(5);
    if (inventory.includes(item)) {
      drop(item);
      locations[currentLocation].inventory.push(item);
      console.log("You dropped " + fancify(item) + ".");
    } else {
      console.log("You can't drop something you don't have.");
    }
  } else if (simplifyString(answer) === "eat pizza") {
    if (currentLocation === "Shower" && showerStatus === 1) {
      if (currentState !== "Full") {
        enterState("Full");
      }
      console.log(
        "It occurs to you that you are now Enlightened. Congratulations, you have won the game!"
      );
      enterState("Enlightened");
    } else if (currentState === "Normal" || currentState === "Hungry") {
      enterState("Full");
      console.log("Ahhh, that 'za was delicious. You are now full.");
      drop("pizza");
    } else if (currentState === "Full") {
      console.log(
        "You eat the pizza even though you're already full. The wife won't be happy about this."
      );
      drop("pizza");
    } else if (currentState === "ON FIRE!!!") {
      console.log(
        "Pizza would be nice, but not being on fire would be better."
      );
      turnTaken = 0;
    }
  } else if (
    simplifyString(answer) === "read seven days" ||
    simplifyString(answer) === "read paper"
  ) {
    if (inventory.includes("seven days")) {
      console.log(sevenDaysArticle);
    } else {
      console.log("You can't read something you don't have.");
    }
  } else if (
    simplifyString(answer) === "xyzzy" ||
    simplifyString(answer) === "combust"
  ) {
    if (currentState === "ON FIRE!!!") {
      console.log("You are already " + currentState);
    } else if (currentLocation === "Shower" && showerStatus === 1) {
      console.log(
        "You momentarily light on fire, but the shower immediately puts the fire out."
      );
    } else {
      console.log(
        "Rock Legend Dave Mustaine rises from the gates of hell and sets you ablaze!!!...The wife won't be happy about this."
      );
      enterState("ON FIRE!!!");
    }
  } else if (
    simplifyString(answer) === "check status" ||
    simplifyString(answer) === "status" ||
    simplifyString(answer) === "check hp" ||
    simplifyString(answer) === "hp"
  ) {
    console.log("You are " + currentState + " with " + hp + " health points.");
    turnTaken = 0;
  } else if (currentLocation === "182 Main St") {
    if (
      (simplifyString(answer) === "read sign" ||
        simplifyString(answer) === "look at sign") &&
      currentLocation === "182 Main St"
    ) {
      console.log(
        'The sign says "Welcome to Burlington Code Academy! Come on up to the third floor. If the door is locked, use the code 12345.'
      );
    } else if (
      simplifyString(answer) === "take sign" ||
      simplifyString(answer) === "steal sign"
    ) {
      console.log(
        "That would be selfish. How will other students find their way?"
      );
      let theifStatus = 1;
    } else if (
      simplifyString(answer) === "open door" ||
      simplifyString(answer) === "enter foyer"
    ) {
      console.log("The door is locked. There is a keypad on the door handle.");
    } else if (
      (simplifyString(answer) === "steal anyway" ||
        simplifyString(answer) === "take anyway") &&
      theifStatus === 1
    ) {
      console.log(
        "As punishment for your insolence, rock Legend Dave Mustaine rises from the gates of hell and sets you ablaze!!!"
      );
      enterState("ON FIRE!!!");
    } else if (
      (simplifyString(answer).includes("enter code") ||
        simplifyString(answer).includes("key")) &&
      answer.includes("12345") === false
    ) {
      console.log("Bzzzzzt! The door is still locked.");
    } else if (
      simplifyString(answer) === "enter code 12345" ||
      simplifyString(answer) === "key 12345"
    ) {
      enterRoom("Foyer");
      console.log(
        "Success! The door opens. You enter the foyer and the door shuts behind you..."
      );
    } else if (
      simplifyString(answer) === "enter mr mikes" ||
      simplifyString(answer) === "go mr mikes"
    ) {
      enterRoom("Mr. Mike's");
      console.log("You head into Mr. Mike's Pizza.");
      if (
        simplifyString(answer).includes("eat pizza") &&
        inventory.excludes("pizza")
      ) {
        console.log("You don't have any pizza to eat.");
        turnTaken = 0;
      }
    } else {
      console.log("Sorry, I don't know how to " + answer + ".");
      turnTaken = 0;
    }
  } else if (currentLocation === "Foyer") {
    if (
      simplifyString(answer) === "take paper" ||
      simplifyString(answer) === "take seven days"
    ) {
      inventory.push("seven days");
      drop("seven days", locations[currentLocation].inventory);
      console.log(
        `You pick up the paper and leaf through it looking for comics and ignoring the articles, just like everybody else does.`
      );
    } else if (
      simplifyString(answer) === "enter bathroom" ||
      simplifyString(answer) === "go bathroom"
    ) {
      enterRoom("Bathroom");
      console.log("You enter the bathroom.");
    } else if (
      simplifyString(answer) === "enter classroom" ||
      simplifyString(answer) === "go classroom"
    ) {
      if (currentState === "ON FIRE!!!") {
        console.log(
          "If you went into class while being on fire, you might scare your classmates. Not a good look."
        );
        turnTaken = 0;
      } else {
        enterRoom("Classroom");
        console.log("You enter the classroom.");
      }
    } else if (
      simplifyString(answer).includes("leave") ||
      simplifyString(answer) === "go outside" ||
      simplifyString(answer) === "go main st"
    ) {
      enterRoom("182 Main St");
      console.log("You head back out onto the street.");
    } else {
      console.log("Sorry, I don't know how to " + answer + ".");
      turnTaken = 0;
    }
  } else if (currentLocation === "Bathroom") {
    if (
      simplifyString(answer) === "enter shower" ||
      simplifyString(answer) === "go shower"
    ) {
      enterRoom("Shower");
      console.log("You hop into the shower.");
      if (showerStatus === 1 && currentState === "ON FIRE!!!") {
        enterState("Normal");
        console.log("Ahh...You put the fire out.");
      }
    } else if (
      (simplifyString(answer) === "use toilet" ||
        simplifyString(answer) === "poop" ||
        simplifyString(answer) === "pee") &&
      bladderStatus === 1
    ) {
      console.log("Ahhh....You relieve yourself.");
      bladderStatus = 0;
    } else if (
      (simplifyString(answer) === "use toilet" ||
        simplifyString(answer) === "poop" ||
        simplifyString(answer) === "pee") &&
      bladderStatus === 0
    ) {
      console.log("You already relieved yourself.");
      turnTaken = 0;
    } else if (simplifyString(answer) === "wash hands") {
      console.log("You wash your hands. They're nice and clean now.");
    } else if (
      simplifyString(answer).includes("leave") ||
      simplifyString(answer) === "go foyer" ||
      simplifyString(answer) === "enter foyer"
    ) {
      enterRoom("Foyer");
      console.log("You leave the bathroom and go back into the foyer.");
    } else {
      console.log("Sorry, I don't know how to " + answer + ".");
      turnTaken = 0;
    }
  } else if (currentLocation === "Shower") {
    if (simplifyString(answer).includes("turn on") && showerStatus === 0) {
      console.log("You turn on the shower.");
      showerStatus = 1;
      if (currentState === "ON FIRE!!!") {
        enterState("Normal");
        console.log("Ahhh...You put the fire out.");
      }
    } else if (
      simplifyString(answer).includes("turn on") &&
      showerStatus === 1
    ) {
      console.log("The shower is already on.");
      turnTaken = 0;
    } else if (
      simplifyString(answer).includes("turn off") &&
      showerStatus == 1
    ) {
      console.log("You turn the shower off. You are not cleaner, just wetter.");
      showerStatus = 0;
    } else if (
      simplifyString(answer).includes("turn off") &&
      showerStatus === 0
    ) {
      console.log("The shower is already off.");
      turnTaken = 0;
    } else if (
      simplifyString(answer).includes("leave") ||
      simplifyString(answer) === "go bathroom" ||
      simplifyString(answer) === "enter bathroom"
    ) {
      enterRoom("Bathroom");
      console.log("You step back into the bathroom.");
    } else {
      console.log("Sorry, I don't know how to " + answer + ".");
      turnTaken = 0;
    }
  } else if (currentLocation === "Mr. Mike's") {
    if (simplifyString(answer) === "order pizza") {
      locations[currentLocation].inventory.push("pizza");
      console.log(
        "Mr. Mike himself makes you a pizza and sets it on the counter."
      );
    } else if (
      simplifyString(answer) === "take pizza" &&
      inventory.includes("pizza") === false
    ) {
      while (locations[currentLocation].inventory.length > 0) {
        inventory.push(locations[currentLocation].inventory.pop());
      }
      console.log("You pick up the pizza you ordered. It smells delicious!");
    } else if (
      simplifyString(answer).includes("take pizza") &&
      inventory.includes("pizza")
    ) {
      console.log("You already have pizza.");
      turnTaken = 0;
    } else if (
      simplifyString(answer).includes("leave") ||
      simplifyString(answer) === "go outside" ||
      simplifyString(answer) === "go main st" ||
      simplifyString(answer) === "enter main st"
    ) {
      enterRoom("182 Main St");
      console.log("You walk back out onto Main St.");
    } else {
      console.log("Sorry, I don't know how to " + answer + ".");
      turnTaken = 0;
    }
  } else if (currentLocation === "Classroom") {
    if (simplifyString(answer).includes("sit")) {
      if (currentState === "ON FIRE!!!") {
        console.log(
          "If you sit down on this nice chair while you're on fire, you'll ruin the chair. You can't bring yourself to be that person."
        );
        turnTaken = 0;
      } else {
        console.log(hungryMessage);
        enterState("Hungry");
      }
    } else if (
      simplifyString(answer).includes("leave") ||
      simplifyString(answer) === "go foyer" ||
      simplifyString(answer) === "enter foyer"
    ) {
      enterRoom("Foyer");
      console.log("You head back out into the foyer.");
    } else if (simplifyString(answer) === "talk to josh") {
      console.log("Josh says 'Hi.'");
    } else {
      console.log("Sorry, I don't know how to " + answer + ".");
      turnTaken = 0;
    }
  } else {
    console.log("Sorry, I don't know how to " + answer + ".");
    turnTaken = 0;
  }
  if (turnTaken === 1 && currentState === "Hungry") {
    hungryTurnsLeft--;
    if (hungryTurnsLeft > 4) {
      console.log("Your stomach grumbles. Pizza is on your mind.");
    } else if (hungryTurnsLeft > 2) {
      console.log("Stomach...So empty...Must...Get pizza...");
    } else if ((hungryTurnsLeft = 0)) {
      console.log("You couldn't eat the pizza in time...");
      enterState("DEAD!");
    }
  }
  if (turnTaken === 1 && currentState === "ON FIRE!!!") {
    hp = Math.round(hp - 20);
    console.log(
      "OOF, ouch, being on fire hurts!! You know have " +
        hp +
        " health points remaining!"
    );
  }
  if (hp <= 0) {
    enterState("DEAD!");
  }
  if (currentState === "DEAD!") {
    console.log("YOU DIED");
  }
}

start();

async function start() {
  console.log(mainStMessage);
  answer = await ask(">");
  while (true) {
    respond(answer);
    if (locations[currentLocation].hasBeen === 0) {
      console.log(locations[currentLocation].welcomeMessage);
      locations[currentLocation].hasBeen = 1;
    }
    if (currentState !== "DEAD!" && currentState !== "Enlightened") {
      answer = await ask(">");
    } else {
      break;
    }
  }
  process.exit();
}
