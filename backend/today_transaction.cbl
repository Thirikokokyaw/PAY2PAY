       IDENTIFICATION DIVISION.
       PROGRAM-ID. TODAY-TRANSACTION.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-CURRENT-DATE-DATA.
           05  WS-YYYY          PIC 9(4).
           05  WS-MM            PIC 9(2).
           05  WS-DD            PIC 9(2).
           05  FILLER           PIC X(13).
       01  WS-DATE-TODAY        PIC X(10).
       
       01  WS-INPUT-LINE.
           05  IN-STATUS        PIC X.
           05  FILLER           PIC X.
           05  IN-SEND-AMT      PIC 9(15).
           05  FILLER           PIC X.
           05  IN-RCV-AMT       PIC 9(15).
           05  FILLER           PIC X.
           05  IN-DATE          PIC X(10).
           05  FILLER           PIC X(50).

       01  WS-EOF-MARKER        PIC X(4) VALUE "EOF ".
       01  WS-TOTALS.
           05  WS-COUNT         PIC 9(6)   VALUE 0.
           05  WS-SUM-IN        PIC 9(15)  VALUE 0.
           05  WS-SUM-OUT       PIC 9(15)  VALUE 0.
           05  WS-NET-PROFIT    PIC S9(15) VALUE 0.

       01  WS-OUTPUT-LINE.
           05  OUT-ORDERS       PIC 9(6).
           05  FILLER           PIC X VALUE ",".
           05  OUT-TOTAL-IN     PIC 9(15).
           05  FILLER           PIC X VALUE ",".
           05  OUT-TOTAL-OUT    PIC 9(15).
           05  FILLER           PIC X VALUE ",".
           05  OUT-PROFIT       PIC S9(15).

       PROCEDURE DIVISION.
       MAIN-LOGIC.
           *> Get current system date
           MOVE FUNCTION CURRENT-DATE(1:8) TO WS-YYYY WS-MM WS-DD.
           
           *> Standard-compliant STRING operation
           STRING WS-YYYY DELIMITED BY SIZE
                  "-"    DELIMITED BY SIZE
                  WS-MM  DELIMITED BY SIZE
                  "-"    DELIMITED BY SIZE
                  WS-DD  DELIMITED BY SIZE
                  INTO WS-DATE-TODAY
           END-STRING.

           PERFORM UNTIL 1 = 0
               ACCEPT WS-INPUT-LINE FROM CONSOLE
               
               *> Check for EOF
               IF WS-INPUT-LINE(1:4) = WS-EOF-MARKER
                   EXIT PERFORM
               END-IF

               *> Logic for current date transactions
               IF IN-DATE = WS-DATE-TODAY
                   ADD 1 TO WS-COUNT
                   ADD IN-SEND-AMT TO WS-SUM-IN
                   ADD IN-RCV-AMT  TO WS-SUM-OUT
               END-IF
           END-PERFORM.

           COMPUTE WS-NET-PROFIT = WS-SUM-IN - WS-SUM-OUT.

           MOVE WS-COUNT    TO OUT-ORDERS.
           MOVE WS-SUM-IN   TO OUT-TOTAL-IN.
           MOVE WS-SUM-OUT  TO OUT-TOTAL-OUT.
           MOVE WS-NET-PROFIT TO OUT-PROFIT.
           
           DISPLAY WS-OUTPUT-LINE.
           STOP RUN.
           