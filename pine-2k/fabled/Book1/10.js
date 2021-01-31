save("save/bookmark", "Book1/10.js");

const MARK = 0;
const GOTO = 1;
const text = [
MARK,
`

  If you have the codeword
Assassin,`,
GOTO,
"Book1/50.js",
`go to 50`,
`immediately. If
not, read on.

  If you have just arrived in
Yellowport, tick the first empty
box above (use a pencil). The
boxes are a record of the number
of times you have visited the
city. If this is your fourth
visit,`,
GOTO,
"Book1/273.js",
`go to 273`,
`. If you have
visited the city fewer than or
more than four times, read on.

  Yellowport is the second largest
city in Sokara. It is mainly a
trading town, and is known for its
exotic goods from distant`,
MARK,
`Ankon-Konu, way to the south.

  The Stinking River brings rich
deposits of sulphur from the Lake
of the Sea Dragon down to the
town, where it is extracted and
stored in the large waterfront
warehouses run by the merchants'
guild. From here, the mineral is
exported all over Harkuna.
Unfortunately, all that sulphur
has its drawbacks. The stink is
abominable, and much of the city
has a yellowish hue. The river is
so full of sulphur that it is
virtually useless as a source of
food or of drinking water.
However, the demand for sulphur,
especially from the sorcerous
guilds, is great.`,
MARK,
`
  Politically, much has changed in
the past few years. The old and
corrupt king of Sokara, Corin VII,
has been deposed and executed in a
military coup. General Grieve
Marlock and the army now control
Sokara. The old Council of
Yellowport has been 'indefinitely
dissolved' and a provost marshal,
Marloes Marlock, the general's
brother, appointed as military
governor of the town.

  You can buy a town house in
Yellowport for 200 Shards. Owning
a house gives you a place to rest,
and to store equipment. If you buy
one, tick the box by the town
house option and cross off 200`,
MARK,
`Shards from your Adventure Sheet.

  To leave Yellowport by sea, buy
or sell ships and cargo, go to the
harbourmaster.

  If you have the codeword Artefact
and the * Book of the Seven Sages
* , you can`,
GOTO,
"Book1/40.js",
`go to 40`,
`.

  Choose from the following
options:
  `,
GOTO,
"Book1/523.js",
`Seek an audience with the
provost marshal`,
`
  `,
GOTO,
"Book1/30.js",
`Visit the market`,
`
  `,
GOTO,
"Book1/555.js",
`Visit the harbourmaster`,
`
  `,
GOTO,
"Book1/405.js",
`Go the merchants' guild`,
`
  `,
GOTO,
"Book1/302.js",
`Explore the city by day`,
`
  `,
GOTO,
"Book1/442.js",
`Explore the city by night`,
`
  `,
GOTO,
"Book1/300.js",
`Visit your town house {box} (if`,
MARK,
`box ticked)`,
`
  `,
GOTO,
"Book1/506.js",
`Visit the Gold Dust Tavern`,
`
  `,
GOTO,
"Book1/141.js",
`Visit the temple of Maka`,
`
  `,
GOTO,
"Book1/316.js",
`Visit the temple of Elnir`,
`
  `,
GOTO,
"Book1/220.js",
`Visit the temple of Alvir and
Valmir`,
`
  `,
GOTO,
"Book1/526.js",
`Visit the temple of Tyrnai`,
`
  `,
GOTO,
"Book1/621.js",
`Travel north-east towards
Venefax`,
`
  `,
GOTO,
"Book1/233.js",
`Head north-west to Trefoille`,
`
  `,
GOTO,
"Book1/82.js",
`Follow the Stinking River north`,
`
  `,
GOTO,
"Book1/558.js",
`Strike out north-west, across
country`,
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
