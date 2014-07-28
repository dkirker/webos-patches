carrierdb
===========
The contents of this directory go into /etc/carrierdb/ on a webOS 2.0 or greater phone. The contents of certs/ go into /etc/carrierdb/certs/.

I have not actually tested to make sure that the SUPL GPS support 100% works. Will do this later.

Setup
===========
NOTE: Linux command line knowledge is MUST for below. Unfortunatly, I do not have time for setup support.

You can do what I did and link carrierdb.json to one of the files included, or just rename one of the files to carrierdb.json.

If you do it the way that I did it, this is what you'd have:

    Pre3 carrierdb # ls -la
    drwxr-xr-x    3 root     root          4096 Dec 31 14:41 .
    drwxr-xr-x   56 root     root          4096 Dec 28 00:01 ..
    lrwxrwxrwx    1 root     root            41 Dec 19 12:36 carrierdb.json -> /etc/carrierdb/carrierdb_tmobile.json
    -rw-r--r--    1 root     root       1229869 Apr  5  2013 carrierdb_backup.json
    -rw-r--r--    1 root     root       1230824 Oct 16 19:04 carrierdb_google.json
    -rw-r--r--    1 root     root       1228832 Oct 16 17:40 carrierdb_tmobile.json

Link carrierdb.json with:

    Pre3 carrierdb # ln -s /etc/carrierdb/carrierdb_tmobile.json carrierdb.json


