save("save/bookmark", "Book1/400.js");

const MARK = 0;
const GOTO = 1;
const text = [
MARK,
`

  Caran Baru is a medium-sized
town, that acts as a way-station
between the citadel to the north,
and the rich towns of the south.
It is a garrison town; many
supplies, arms, and soldiers move
through Caran Baru on the
north-south trail. Shops, temples,
traders, and the like have sprung
up here to serve the needs of the
military. There is also a sizeable
mining community, for the mines of
Sokara lie in the Bronze Hills,
just outside town, and a slave
market where poor unfortunates,
sold into slavery, are bought for
work in the mines.
`,
MARK,
`  You can buy a town house in Caran
Baru for 200 Shards. Owning a town
house gives you a place to rest,
and to store equipment. If you buy
one , tick the box by the town
house option.

  If you have the codeword
Barnacle,`,
GOTO,
"Book1/418.js",
`go to 418`,
`immediately.
Otherwise, pick from the following
options.
  `,
GOTO,
"Book1/215.js",
`Visit the marketplace`,
`
  `,
GOTO,
"Book1/112.js",
`Visit the merchants' guild`,
`
  `,
GOTO,
"Book1/473.js",
`Visit the slave market`,
`
  `,
GOTO,
"Book1/282.js",
`Visit the temple of Tyrnai`,
`
  `,
GOTO,
"Book1/615.js",
`Visit the temple of Lacuna`,
`
  `,
GOTO,
"Book1/86.js",
`Visit the temple of the Three
Fortunes`,
`
  `,
GOTO,
"Book1/177.js",
`Visit your town house {box} (if
box ticked)`,
MARK,
`  `,
GOTO,
"Book1/184.js",
`Visit the Blue Griffon Tavern`,
`
  `,
GOTO,
"Book1/201.js",
`Follow the road north to the
citadel`,
`
  `,
GOTO,
"Book1/110.js",
`Go west into the Bronze Hills`,
`
  `,
GOTO,
"Book1/60.js",
`Travel north east into the
country`,
`
  `,
GOTO,
"Book1/458.js",
`Take the east road to Fort
Mereth`,
`
  `,
GOTO,
"Book1/474.js",
`Head south east into the
mountains`,
`
  `,
GOTO,
"Book1/347.js",
`Take the south road`,
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
