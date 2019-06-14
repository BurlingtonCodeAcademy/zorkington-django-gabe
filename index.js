//user can turn around and come back, limited messages
//fix inventory bug
//hunger questline
//shower questline
//7 days article

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

const mainStMessage =
  `182 Main St. You are standing on Main Street between Church and South Winooski.
  There is a door here. A keypad sits on the handle. On the door is a handwritten sign.`;
const foyerMessage = `You are in a foyer. Or maybe it's an antechamber. Or a vestibule.
  Or an entryway. Or an atrium. Or a narthex. But let's forget all that fancy flatlander vocabulary,
  and just call it a foyer. In Vermont, this is pronounced "FO-ee-yurr".
  \nA copy of Seven Days lies in a corner. There is a door to a bathroom.`;
const classroomMessage = `You are in the classroom. Class is about to begin. A sign reads "Bathroom code: 0202"`;
const bathroomMessage = 'You enter the bathroom. It is not the cleanest bathroom but it will suffice. There just so happens to be a shower.'
const mrMikesMessage = `Wow Mr. Mike's has got it goin' on. Pizza galore! You sit down with your best buddy Bob who just got a delicious looking code-covered pizza.`
const sevenDaysArticle = `The paper reads: GEMINI (May 21-June 20): In the 1960s, Gemini musician Brian Wilson began writing and recording best-selling songs with his band the Beach Boys. 
\nA seminal moment in his development happened while he was listening to his car radio in August 1963. A tune he had never heard before came on: "Be My Baby" by the Ronettes. 
\nWilson was so excited he pulled over onto the shoulder of the road and stopped driving so he could devote his full attention to what he considered a shockingly beautiful work of art. 
\n"I started analyzing all the guitars, pianos, bass, drums and percussion," he told the New York Times. "Once I got all those learned, I knew how to produce records." 
\nI suspect a pivotal moment like this could unfold for you in the coming weeks, Gemini. Be alert!`

let locations = {
  "182 Main St": { 
    canChangeTo: ["Foyer", "Mr. Mike's"],
    hasBeen: 0,
    welcomeMessage: mainStMessage 
  },
  "Foyer": {
    canChangeTo: ["182 Main St", "Classroom", "Bathroom"],
    inventory: ["A copy of Seven Days"],
    hasBeen: 0,
    welcomeMessage: foyerMessage
  },
  "Classroom": {
    canChangeTo: ["Foyer"],
    hasBeen: 0,
    welcomeMessage: classroomMessage
  },
  "Bathroom": {
    canChangeTo: ["Foyer", "Shower"],
    hasBeen: 0,
    welcomeMessage: bathroomMessage
  },
  "Shower": { canChangeTo: ["Bathroom"] },
  "Mr. Mike's": {
    canChangeTo: ["182 Main St"],
    hasBeen: 0,
    welcomeMessage: mrMikesMessage
  }
};

let states = {
  Normal: { canChangeTo: ["ON FIRE!!!", "Hungry"] },
  Hungry: { canChangeTo: ["ON FIRE!!!", "Full", "DEAD!"] },
  Full: { canChangeTo: ["ON FIRE!!!"] },
  "ON FIRE!!!": { canChangeTo: ["Normal", "Hungry", "DEAD!"] },
  Dead: { canChangeTo: [] }
};

let currentState = "Normal";
let currentLocation = "182 Main St";
let hp = 100;
let inventory = [];
//let foyerInventory = ['A copy of Seven Days']

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

function parseAnswer(answer) {
  let turnTaken = 1;       //for fire damage. by default we assume that the player response costs a turn and deals damage
  if (
    answer.toLowerCase() === "i" ||
    answer.toLowerCase() === "display inventory" ||
    answer.toLowerCase() === "take inventory"
  ) {
    if (inventory.length === 0) {
      console.log("You aren't carrying anything.");
    } else {
      console.log("You are carrying:\n" + inventory.join(", "));
    }
    turnTaken = 0;
  } else if (answer.toLowerCase().startsWith("drop")) {
    let item = answer.slice(5); //change item for more general answers
    if (inventory.includes(item)) {
      drop(item);
      currentLocation.inventory.push(item);
      console.log("You dropped " + item + ".");
    } else {
      console.log("You can't drop something you don't have.");
    }
  } else if (
    answer.toLowerCase() === "read seven days" ||
    answer.toLowerCase() === "read paper"
  ) {
    if (inventory.includes("A copy of Seven Days")) {
      console.log("ANSWER HERE");                  //article here
    } else {
      console.log("You can't read something you don't have.");
    }
  } else if (answer.toLowerCase() === "xyzzy" || answer.toLowerCase() === "combust") {
    if (currentState==="ON FIRE!!!") {
      console.log('You are already ' + currentState)
    } else {
      console.log("Rock Legend Dave Mustaine rises from the gates of hell and sets you ablaze!!!");
    }
    enterState("ON FIRE!!!");
  } else if (
    answer.toLowerCase() === "check status" ||
    answer.toLowerCase() === "status" ||
    answer.toLowerCase() === "check hp" ||
    answer.toLowerCase() === "hp"
  ) {
    console.log("You are " + currentState + " with " + hp + " health points.");
    turnTaken = 0;
  } else if (currentLocation === "182 Main St") {
    //182 main st
    if (
      (answer.toLowerCase() === "read sign" ||
        answer.toLowerCase() === "read the sign" ||
        answer.toLowerCase() === "look at sign" ||
        answer.toLowerCase() === "look at the sign") &&
      currentLocation === "182 Main St"
    ) {
      console.log(
        'The sign says "Welcome to Burlington Code Academy! Come on up to the third floor. If the door is locked, use the code 12345.>'
      );
    } else if (
      answer.toLowerCase() === "take the sign" ||
      answer.toLowerCase() === "steal the sign"
    ) {
      console.log(
        "That would be selfish. How will other students find their way."
      );
    } else if (answer.toLowerCase() === "open door") {
      console.log("The door is locked. There is a keypad on the door handle.");
    } else if (
      (answer.toLowerCase().includes("enter code") ||
        answer.toLowerCase().includes("key in")) &&
      answer.includes("12345") === false
    ) {
      console.log("Bzzzzzt! The door is still locked.");
    } else if (answer === "enter code 12345" || answer === "key in 12345") {
      enterRoom("Foyer");
      console.log(
        "Success! The door opens. You enter the foyer and the door shuts behind you..."
      );
    }
  } else if (currentLocation === "Foyer") {
    if (
      answer.toLowerCase() === "take paper" ||
      answer.toLowerCase() === "take seven days"
    ) {
      inventory.push("A copy of Seven Days");
      drop("A copy of Seven Days", foyerInventory);
      console.log(
        `You pick up the paper and leaf through it looking for comics and ignoring the articles, just like everybody else does.`
      );
    }
    if (answer.toLowerCase()=== "enter bathroom" ) {
      enterRoom("Bathroom");
      console.log("You enter the bathroom.")
    }
  } else {
    console.log("Sorry, I don't know how to " + answer + ".");
  }
  if (turnTaken===1 && currentState==="ON FIRE!!!") {
    hp = Math.round(hp - 20);
    console.log("OOF, ouch, being on fire hurts!! You know have " + hp + " health points remaining!")
  }
  if (hp <= 0) {
    enterState("DEAD!")
    console.log()
  }
}

start();

async function start() {
  console.log(mainStMessage);
  answer = await ask(">");
  while (currrentState!=="DEAD!") {
    if (locations.currentLocation.hasBeen===0) {
      console.log(locations.currentLocation.welcomeMessage);
      locations.currentLocation.hasBeen = 1;
    }
    parseAnswer(answer);
    answer = await ask(">");
  }
  process.exit();
}

// async function start() {
//   const welcomeMessage = `182 Main St.
// You are standing on Main Street between Church and South Winooski.
// There is a door here. A keypad sits on the handle.
// On the door is a handwritten sign.\n>`;
//   let answer = await ask(welcomeMessage);
//   while (currentLocation === "182 Main St") {
//     if (
//       (answer.toLowerCase() === "read sign" ||
//         answer.toLowerCase() === "read the sign" ||
//         answer.toLowerCase() === "look at sign" ||
//         answer.toLowerCase() === "look at the sign") &&
//       currentLocation === "182 Main St"
//     ) {
//       answer = await ask(
//         'The sign says "Welcome to Burlington Code Academy! Come on up to the third floor. If the door is locked, use the code 12345.\n>'
//       );
//     } else if (
//       answer.toLowerCase() === "take the sign" ||
//       answer.toLowerCase() === "steal the sign"
//     ) {
//       answer = await ask(
//         "That would be selfish. How will other students find their way?\n>"
//       );

//     } else if (answer.toLowerCase()==='open door') {
//       answer = await ask('The door is locked. There is a keypad on the door handle.\n>');
//     } else if ((answer.toLowerCase().includes('enter code') || answer.toLowerCase().includes('key in')) && answer.includes('12345')===false) {
//       answer = await ask('Bzzzzzt! The door is still locked.\n>');
//     } else if (answer==='enter code 12345' || answer==='key in 12345') {
//       enterRoom('Foyer');
//       console.log('Success! The door opens. You enter the foyer and the door shuts behind you...\n>');
//     } else {
//       answer = await ask("Sorry, I don't know how to " + answer + ".\n>");
//     }
//   }
//   if (currentLocation==='Foyer') {
//     answer = await ask(`You are in a foyer. Or maybe it's an antechamber. Or a
//     vestibule. Or an entryway. Or an atrium. Or a narthex.
//     But let's forget all that fancy flatlander vocabulary,
//     and just call it a foyer. In Vermont, this is pronounced
//     "FO-ee-yurr".\nA copy of Seven Days lies in a corner. A door to the bathroom is to your left.\n>`)
//   }
//   while (currentLocation==='Foyer') {
//       if (answer.toLowerCase()==='take paper' || answer.toLowerCase()==='take seven days') {
//         inventory.push('A copy of Seven Days')
//         drop('A copy of Seven Days', foyerInventory)
//         answer.toLowerCase() = await ask (`You pick up the paper and leaf through it looking for comics
//         and ignoring the articles, just like everybody else does.\n>`);
//       } else if (answer.toLowerCase()==='i' || answer.toLowerCase()==='display inventory' || answer.toLowerCase()==='take inventory') {
//         if (inventory.length===0) {
//           answer.toLowerCase() = await ask ('You aren\'t carrying anything.\n>')
//         } else {
//           answer.toLowerCase() = await ask ('You are carrying:\n' + inventory.join(', '));
//         }
//       } else if (answer.toLowerCase()==='drop paper' || answer.toLowerCase()==='drop seven days') {
//         if (inventory.includes('seven days')) {
//           drop('A copy of Seven Days');
//           foyerInventory.push('A copy of Seven Days')
//           answer.toLowerCase() = await ask ('You dropped the paper.\n>')
//         } else {
//           answer.toLowerCase() = await ask ('You can\'t drop something you don\'t have!')
//         }
//       } else {
//         answer.toLowerCase() = await ask("Sorry, I don't know how to " + answer + ".\n>");
//       }
//     }
//    if (currentLocation==='Classroom') {
answer = await ask(
  `You are in the classroom. Class is about to begin. A sign reads "Bathroom code: 0202"`
);

//   }
//   process.exit();
// }

// GEMINI (May 21-June 20): In the 1960s, Gemini musician Brian Wilson began writing and recording best-selling songs with his band the Beach Boys. 
// A seminal moment in his development happened while he was listening to his car radio in August 1963. A tune he had never heard before came on: "Be My Baby" by the Ronettes. 
// Wilson was so excited he pulled over onto the shoulder of the road and stopped driving so he could devote his full attention to what he considered a shockingly beautiful work of art. 
// "I started analyzing all the guitars, pianos, bass, drums and percussion," he told the New York Times. "Once I got all those learned, I knew how to produce records." 
// I suspect a pivotal moment like this could unfold for you in the coming weeks, Gemini. Be alert!
