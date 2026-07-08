       IDENTIFICATION DIVISION.
       PROGRAM-ID. DAILY-REPLENISH.

       ENVIRONMENT DIVISION.
       
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-CMD-ARGS          PIC X(255).
       01  WS-ACTION            PIC X(20).
       01  WS-TARGET-WALLET     PIC X(30).
       01  WS-REPLENISH-AMT-STR PIC X(15).
       01  WS-REPLENISH-NUM     PIC 9(9).
       01  WS-IDX               PIC 9(3).

       PROCEDURE DIVISION.
       0000-MAIN.
           DISPLAY " " UPON COMMAND-LINE
           ACCEPT WS-CMD-ARGS FROM COMMAND-LINE

           IF WS-CMD-ARGS = SPACES
               DISPLAY "ERROR|No setup arguments provided."
               STOP RUN
           END-IF.

           UNSTRING WS-CMD-ARGS DELIMITED BY ","
               INTO WS-ACTION
                    WS-TARGET-WALLET
                    WS-REPLENISH-AMT-STR
           END-UNSTRING.

           EVALUATE FUNCTION UPPER-CASE(FUNCTION TRIM(WS-ACTION))
               WHEN "REPLENISH"
                   PERFORM 1000-EXECUTE-REPLENISH
               WHEN OTHER
                   DISPLAY "ERROR|Unsupported in replenishment batch."
           END-EVALUATE.

           STOP RUN.

       1000-EXECUTE-REPLENISH.
           MOVE FUNCTION TRIM(WS-REPLENISH-AMT-STR) 
           TO WS-REPLENISH-AMT-STR
           PERFORM VARYING WS-IDX FROM 1 BY 1 
                   UNTIL WS-IDX > 
                   FUNCTION LENGTH(FUNCTION TRIM(WS-REPLENISH-AMT-STR))
               IF WS-REPLENISH-AMT-STR(WS-IDX:1) < "0" OR 
                  WS-REPLENISH-AMT-STR(WS-IDX:1) > "9"
                   DISPLAY "ERROR|Amount must be integers."
                   STOP RUN
               END-IF
           END-PERFORM.

           MOVE FUNCTION NUMVAL(WS-REPLENISH-AMT-STR) 
           TO WS-REPLENISH-NUM.

           IF FUNCTION TRIM(WS-TARGET-WALLET) = SPACES
               DISPLAY "ERROR|Target ledger node identifier is blank."
               STOP RUN
           END-IF.

           DISPLAY "SUCCESS|Validation checklist cleared.".