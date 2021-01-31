save("save/bookmark", "Book1/Chalor.js");

const MARK = 0;
const GOTO = 1;
const text = [
MARK,
`

  Chalor is an outcast by choice,
shunning his native land and the
family who spurned him, driven by
a burning desire for secret
knowledge. His goal is to become
one of the mightiest wizards of
the world, and nothing will stand
in his way. For now, he is looking
for the Gold Dust tavern in
Yellowport, where adventure
awaits.

  You can play as Chalor, or as a
mage with a different name (enter
it in the 'Name' field). To begin
your adventure,`,
GOTO,
"Book1/1.js",
`go to 1`,
`.

  For another profession, choose`,
MARK,
`from the following:
  `,
GOTO,
"Book1/Liana.js",
`Wayfarer`,
`
  `,
GOTO,
"Book1/Andriel.js",
`Warrior`,
`
  `,
GOTO,
"Book1/Marana.js",
`Rogue`,
`
  `,
GOTO,
"Book1/Ignatius.js",
`Priest`,
`
  `,
GOTO,
"Book1/Astariel.js",
`Troubadour`,
MARK
];

const funcs = new Array(5);
funcs[MARK] = f_mark;
funcs[GOTO] = f_goto;

window(0, 0, 220, 176);
io("FILLER", 3, "TEXT", "5x7");
io("FORMAT", 0, 0);

var index, selection = 0;
var position = 1, mark = 0;
var isLastMark = false;


const abilities = [2,2,6,1,5,3];
save("save/abilities", abilities);


save("save/name", "Chalor the Exiled One");


render();

function f_mark(){
    position = index + 1;
    mark = index;
}

function f_goto(trigger){
    var page = text[index + 1];
    var caption = text[index + 2];
    var selected = ((index - mark) == selection);
    if(selected) print("[");
    else print(" ");
    print(caption);
    if(selected) print("]");
    else print(" ");

    index += 2;

    if(trigger){
        position = -1;
        splash(0, 0, "splash.565");
        window(0, 166, 220, 176);
        io("CLEARTEXT");
        cursor(1, 21);
        print(caption);
        exec(page);
    }
}

function isText(i){
    var line = text[i];
    return line < 0 || line >= length(funcs);
}

function render(){
    if(position < 0)
        return;
    io("CLEARTEXT");
    fill(0);
    cursor(0,0);
    color(32);
    index = position;
    for(; text[index] != MARK; ++index){
        var line = text[index];
        if(isText(index)) print(line);
        else funcs[line](false);
    }
    isLastMark = index == length(text) - 1;
    color(7);
}

function update(){
    if(justPressed("C"))
        exit();

    if(justPressed("A")){
        index = mark + selection;
        funcs[text[index]](true);
        render();
    }

    if(!isLastMark){
        flip(true);
        sprite(220-8, 176-8, builtin("cursor2"));
    }

    var direction = justPressed("DOWN") - justPressed("UP");
    if(direction == 0){
        return;
    }
    var prevPrev = 0;
    var prevMark = 0;
    var prevSelection = -1;
    var curSelection = -1;
    var absSelection = mark + selection + (direction > 0);
    index = (mark + selection) * (direction > 0);
    for( ; (prevSelection != absSelection) && (isText(curSelection) || curSelection < absSelection); ++index){
        if(index >= length(text)) return;
        if(isText(index)) continue;
        prevSelection = curSelection;
        curSelection = index;
        var line = text[index];
        if(line != MARK){
            funcs[line](false);
        } else {
            prevPrev = prevMark;
            prevMark = index;
        }
    }

    if(direction > 0){
        index = curSelection;
    }else{
        if(prevSelection < mark){
            if(mark == 0)
                return;
            index = prevPrev;
            funcs[MARK](false);
        }
        index = prevSelection;
    }

    if(text[index] == MARK){
        if(isLastMark && direction > 0){
            render();
            return;
        }
        selection = 0;
    }else
        selection = index - mark;

    funcs[text[index]](false);

    render();
}
