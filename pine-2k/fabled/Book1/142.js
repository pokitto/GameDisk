save("save/bookmark", "Book1/142.js");

const MARK = 0;
const GOTO = 1;
const text = [
MARK,
`

  All shipping in and out of
Marlock City must come through the
offices of the harbourmaster. Here
you can buy passage to far lands,
or even a ship of your own, to
fill with cargo and crew.

  You can buy one-way passage on a
ship to the following
destinations:
  `,
GOTO,
"Book1/372.js",
`Yellowport, cost 10 Shards`,
`
  `,
GOTO,
"Book1/455.js",
`Wishport, cost 15 Shards`,
`
  `,
GOTO,
"Book1/234.js",
`Sorcerer's Isle, cost 30 Shards`,
`
  `,
GOTO,
"Book1/424.js",
`Copper Island, cost 30 Shards`,
`

  If you buy a ship, you are the
captain and can take it where you
wish, exploring or trading. You`,
MARK,
`also get to name it. There are
three types of ship, and four
types of crew quality. You can
also buy cargo for your ship to
sell in other ports.

  If you buy a ship, add it to the
Ship's Manifest, and name it as
you wish. The quality of the
ship's crew is average, unless you
pay to upgrade it. If you already
own a ship you can sell it to the
harbourmaster at half the above
prices. _ [To sell a ship, use the
following options:] _

  It costs to upgrade a poor crew
to average, to upgrade an average
crew to good, and to upgrade a
good crew to excellent.`,
MARK,
`
  Cargo can be bought at Marlock
City and sold at other ports for
profit. If you own a ship, you can
buy as many Cargo Units as it has
room for. You may also sell cargo,
if you have any. Prices quoted
here are for entire Cargo Units.

  Fill in your current cargo on the
Ship's Manifest - assuming you own
a ship!

  If you own a ship and wish to set
sail,`,
GOTO,
"Book1/84.js",
`go to 84`,
`. If not you can go
to the city centre.`,
GOTO,
"Book1/100.js",
`go to 100`,
`.`,
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
