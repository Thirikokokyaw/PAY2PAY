       IDENTIFICATION DIVISION.
       PROGRAM-ID. EXCH-STATS-ENGINE.
       AUTHOR.     LUCIA.

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT TXN-FILE ASSIGN TO "EXCHANGE_TXN_DATA.DAT"
             ORGANIZATION IS LINE SEQUENTIAL.

       DATA DIVISION.
       FILE SECTION.
       FD  TXN-FILE.
       01  TXN-RECORD.
           05  COB-TXN-ID          PIC 9(11).
           05  COB-USER-ID         PIC 9(11).
           05  COB-FROM-WALLET     PIC X(10).
           05  COB-TO-WALLET       PIC X(10).
           05  COB-SEND-AMOUNT     PIC 9(13)V99.
           05  COB-RECEIVE-AMOUNT  PIC 9(13)V99.
           05  COB-STATUS          PIC X(01).      
           05  COB-CREATED-AT      PIC X(19).      

       WORKING-STORAGE SECTION.
       01  SWITCHES.
           05  EOF-SWITCH          PIC X(01) VALUE 'N'.
               88 END-OF-FILE                VALUE 'Y'.

       01  COUNTERS-AND-TOTALS.
           05  WS-TOTAL-EXCHANGES  PIC 9(06) VALUE ZERO.
           05  WS-PENDING-COUNT    PIC 9(06) VALUE ZERO.
           05  WS-APPROVED-COUNT   PIC 9(06) VALUE ZERO.

       01  DISPLAY-FIELDS.
           05  DISP-TOTAL          PIC ZZZ,ZZ9.
           05  DISP-PENDING        PIC ZZZ,ZZ9.

       PROCEDURE DIVISION.
       0000-MAIN-LOGIC.
           OPEN INPUT TXN-FILE
           
           PERFORM UNTIL END-OF-FILE
               READ TXN-FILE
                   AT END
                       SET END-OF-FILE TO TRUE
                   NOT AT END
                       PERFORM 1000-PROCESS-TRANSACTION
               END-READ
           END-PERFORM

           CLOSE TXN-FILE
           
           MOVE WS-TOTAL-EXCHANGES TO DISP-TOTAL
           MOVE WS-PENDING-COUNT   TO DISP-PENDING
           
           DISPLAY "--- COBOL BACKEND DATABASE AGGREGATION REPORT ---"
           DISPLAY "TOTAL EXCHANGES IN DB : " DISP-TOTAL
           DISPLAY "TOTAL PENDING IN DB   : " DISP-PENDING
           
           STOP RUN.

       1000-PROCESS-TRANSACTION.
           ADD 1 TO WS-TOTAL-EXCHANGES
           IF COB-STATUS = "0"
               ADD 1 TO WS-PENDING-COUNT
           ELSE IF COB-STATUS = "1"
               ADD 1 TO WS-APPROVED-COUNT
           END-IF.
           