save("save/bookmark", "Book1/100.js");

const MARK = 0;
const GOTO = 1;
const text = [
MARK,
`

  Marlock City is a huge sprawling
metropolis, enclosed in a
fortified wall said to have been
built one thousand years ago by
the ancient Shadar Empire. It is
the capital city of Sokara.
Marlock City was once known as
Sokar, until General Grieve
Marlock led the army in bloody
revolt against the old king, Corin
VII, and had him executed. The
general renamed the city after
himself - it is now a crime to
call it Sokar.

  The general lives in the old
king's palace, and calls himself
the Protector-General of all`,
MARK,
`Sokara. Whereas the old king was
corrupt, the general rules with a
fist of iron. Some people like the
new regime; others are royalists,
still loyal to Nergan, the heir to
the throne, who has gone into
hiding somewhere.

  Outside the city gates hang the
bodies of many dead people -
labels around their necks read:
'Rebels, executed by the state for
the good of the people'.

  'You'd best behave yourself if
you don't want to end up like one
of them,' grates a guardsman,
nodding towards the swinging
corpses, as you pass through the
great eagle-headed gates of`,
MARK,
`Marlock City.

  You can buy a town house in
Marlock City for 200 Shards.
Owning a house gives you a place
to rest, and to store equipment.
If you buy one, cross off 200
Shards and tick the box by the
town house option.

  To leave Marlock City by sea, or
to buy or sell ships and cargo, go
the harbourmaster.
  `,
GOTO,
"Book1/158.js",
`Visit the Three Rings Tavern`,
`
  `,
GOTO,
"Book1/154.js",
`Visit the temple of Alvir and
Valmir`,
`
  `,
GOTO,
"Book1/71.js",
`Visit the temple of Nagil`,
`
  `,
GOTO,
"Book1/235.js",
`Visit the temple of Sig`,
`
  `,
GOTO,
"Book1/568.js",
`Visit the temple of Elnir`,
`
  `,
GOTO,
"Book1/396.js",
`Visit the market`,
MARK,
`  `,
GOTO,
"Book1/142.js",
`Visit the harbourmaster`,
`
  `,
GOTO,
"Book1/571.js",
`Go to the merchants' guild`,
`
  `,
GOTO,
"Book1/138.js",
`Explore the city`,
`
  `,
GOTO,
"Book1/434.js",
`Visit your town house {box} (if
box ticked)`,
`
  `,
GOTO,
"Book1/535.js",
`Visit the House of Priests`,
`
  `,
GOTO,
"Book1/601.js",
`Visit the general's palace`,
`
  `,
GOTO,
"Book1/377.js",
`Travel east towards Trefoille`,
`
  `,
GOTO,
"Book1/166.js",
`Head south-east towards the
Shadar Tor`,
`
  `,
GOTO,
"Book1/99.js",
`Follow the River Grimm north`,
`
  `,
GOTO,
"Book1/175.js",
`Journey north into the Curstmoor`,
`
  `,
GOTO,
"Book1/579.js",
`Head west to the River Grimm
delta`,
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
