
const abilities = file("save/abilities", 0);
const choices = [4];
const prefixes = [" \n  ", " \n->"];
var roll;
var abilityPoints;
var choice = 0;

window(0, 0, 220, 176);
io("FILLER", 3, "TEXT", "5x7");
io("FORMAT", 0, 0);

function f_goto(page, caption){
    splash(0, 0, "splash.565");
    window(0, 166, 220, 176);
    io("CLEARTEXT");
    cursor(1, 21);
    print("Rolled ");
    print(roll);
    print("+");
    print(abilityPoints);
    print(". ");
    print(caption);
    exec(page);
}

function success(ability){
    f_goto("Book1/679.js", "Success!");return;
}

function fail(){
    f_goto("Book1/36.js", "Failure!");return;
}

function update(){
  cursor(0,0);
  print("Make a SCOUTING roll at a difficulty of 10");

  print(prefixes[choice == 0]); print(" scouting: "); print(abilities[4]);

  cursor(15, 10);
  print("     ");
  cursor(15, 10);
  roll = random(2, 13);
  print(roll);

  choice = max(0, min(0, choice + justPressed("DOWN") - justPressed("UP")));

  if(!justPressed("A"))
    return;

  var ability = choices[ choice ];
  abilityPoints = abilities[ ability ];

  if((roll + abilityPoints) >= 10){
    success(ability);
  } else {
    fail();
  }
}
