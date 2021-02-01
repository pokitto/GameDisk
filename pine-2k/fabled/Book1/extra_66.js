
const saveData = file("save/player", 0);
window(0, 0, 220, 176);
io("FILLER", 3, "TEXT", "5x7");
io("FORMAT", 0, 0);
cursor(0,0);
print("Make a MAGIC roll at a difficulty of 9");

function f_goto(page, caption){
    splash(0, 0, "splash.565");
    window(0, 166, 220, 176);
    io("CLEARTEXT");
    cursor(1, 21);
    print(caption);
    exec(page);
}

function success(ability){
    
    f_goto("Book1/449.js", "Success!");
}

function fail(){
    f_goto(""Book1/105.js"", "Failure!");return; /* 66 */
}

function update(){
  cursor(15, 10);
  print("     ");
  cursor(15, 10);
  var num = random(2, 13);
  print(num);
  if(!justPressed("A"))
    return;
  if(num >= 9){
    success(2);
  } else {
    fail();
  }
}
