var bookmark = file("save/bookmark", 0);

if( !bookmark ){
    exec("Book1/New.js");
} else {
    io("FILLER", 3, "TEXT", "5x7");
    splash(0, 0, "splash.565");
    window(0, 166, 220, 176);
    cursor(1, 21);
    print(bookmark);
    exec(bookmark);
}
