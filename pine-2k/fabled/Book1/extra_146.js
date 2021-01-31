
const abilities = file("save/abilities", 0);
const choices = [1,5];
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
    f_goto("Book1/extra_147.js", "Success!");return;
}

function fail(){
    f_goto("Book1/extra_148.js", "Failure!");return;
}

function update(){
  cursor(0,0);
  print("make a COMBAT or a THIEVERY roll at Difficulty 12");

  print(prefixes[choice == 0]); print(" combat: "); print(abilities[1]);
print(prefixes[choice == 1]); print(" thievery: "); print(abilities[5]);

  cursor(15, 10);
  print("     ");
  cursor(15, 10);
  roll = random(2, 13);
  print(roll);

  choice = max(0, min(1, choice + justPressed("DOWN") - justPressed("UP")));

  if(!justPressed("A"))
    return;

  var ability = choices[ choice ];
  abilityPoints = abilities[ ability ];

  if((roll + abilityPoints) >= 12){
    success(ability);
  } else {
    fail();
  }
}
