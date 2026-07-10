       IDENTIFICATION DIVISION.
       PROGRAM-ID. EXCHANGE-FORM-ENGINE.

       ENVIRONMENT DIVISION.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-CMD-ARGS           PIC X(255).
       01  WS-ACTION             PIC X(20).
       01  WS-AMOUNT-STR         PIC X(15).
       01  WS-BALANCE-STR        PIC X(15).
       01  WS-TXN-TAIL           PIC X(10).
       01  WS-SENDER-PHONE       PIC X(20).
       01  WS-RECEIVER-PHONE     PIC X(20).

       01  WS-AMOUNT-NUM         PIC 9(9).
       01  WS-BALANCE-NUM        PIC 9(9).
       01  WS-IDX                PIC 9(3).
       01  WS-PHONE-LEN          PIC 9(2).

       PROCEDURE DIVISION.
       0000-MAIN.
      *    Accept arguments sent from Node.js child_process
           ACCEPT WS-CMD-ARGS FROM COMMAND-LINE

           IF WS-CMD-ARGS = SPACES
               DISPLAY "ERROR|Runtime arguments string missing."
               STOP RUN
           END-IF.

      *    Parse delimited string using comma character
           UNSTRING WS-CMD-ARGS DELIMITED BY ","
               INTO WS-ACTION
                    WS-AMOUNT-STR
                    WS-BALANCE-STR
                    WS-TXN-TAIL
                    WS-SENDER-PHONE
                    WS-RECEIVER-PHONE
           END-UNSTRING.

           EVALUATE FUNCTION UPPER-CASE(FUNCTION TRIM(WS-ACTION))
               WHEN "VALIDATE_TXN"
                   PERFORM 1000-VALIDATE-CORE-RULES
               WHEN OTHER
                   DISPLAY "ERROR|Unsupported validation token action."
           END-EVALUATE.

           STOP RUN.

       1000-VALIDATE-CORE-RULES.
           MOVE FUNCTION TRIM(WS-AMOUNT-STR) TO WS-AMOUNT-STR
           PERFORM VARYING WS-IDX FROM 1 BY 1 
                   UNTIL WS-IDX > 
                   FUNCTION LENGTH(FUNCTION TRIM(WS-AMOUNT-STR))
               IF WS-AMOUNT-STR(WS-IDX:1) < "0" OR 
                  WS-AMOUNT-STR(WS-IDX:1) > "9"
                   DISPLAY "ERROR|Transfer amount must be digits only."
                   STOP RUN
               END-IF
           END-PERFORM.

           MOVE FUNCTION NUMVAL(WS-AMOUNT-STR) TO WS-AMOUNT-NUM.
           MOVE FUNCTION NUMVAL(WS-BALANCE-STR) TO WS-BALANCE-NUM.

           IF WS-AMOUNT-NUM < 1000
               DISPLAY "ERROR|Transfer amount at least 1000 MMK."
               STOP RUN
           END-IF.

           IF WS-AMOUNT-NUM > WS-BALANCE-NUM
               DISPLAY "ERROR|Insufficient funds. ."
               STOP RUN
           END-IF.

           MOVE FUNCTION TRIM(WS-TXN-TAIL) TO WS-TXN-TAIL
           IF FUNCTION LENGTH(FUNCTION TRIM(WS-TXN-TAIL)) NOT = 6
               DISPLAY "ERROR|Transaction must be exactly 6 digits."
               STOP RUN
           END-IF.

           MOVE FUNCTION LENGTH(FUNCTION TRIM(WS-SENDER-PHONE)) 
           TO WS-PHONE-LEN
           IF WS-PHONE-LEN < 10 OR WS-PHONE-LEN > 11
               DISPLAY "ERROR|Phone number must be 10 or 11 digits."
               STOP RUN
           END-IF.

           MOVE FUNCTION LENGTH(FUNCTION TRIM(WS-RECEIVER-PHONE)) 
           TO WS-PHONE-LEN
           IF WS-PHONE-LEN < 10 OR WS-PHONE-LEN > 11
               DISPLAY "ERROR|Phone number must be 10 or 11 digits."
               STOP RUN
           END-IF.

           DISPLAY "SUCCESS|VALIDATION_PASSED".
