       IDENTIFICATION DIVISION.
       PROGRAM-ID. EXCHANGE-FORM-VALIDATOR.

       ENVIRONMENT DIVISION.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-CMD-ARGS          PIC X(255).
       01  WS-POINTER           PIC 9(3) VALUE 1.

       01  WS-ACTION            PIC X(20).
       01  WS-AMOUNT-STR        PIC X(15).
       01  WS-TXN-TAIL          PIC X(10).
       01  WS-SENDER-PHONE      PIC X(20).
       01  WS-RECEIVER-PHONE    PIC X(20).

       01  WS-AMOUNT-NUM        PIC 9(9).
       01  WS-IDX               PIC 9(3).

       PROCEDURE DIVISION.
       0000-MAIN.

           ACCEPT WS-CMD-ARGS FROM COMMAND-LINE

           IF WS-CMD-ARGS = SPACES
               DISPLAY "ERROR|No runtime tracking arguments provided."
               STOP RUN
           END-IF.

           UNSTRING WS-CMD-ARGS DELIMITED BY ","
               INTO WS-ACTION
                    WS-AMOUNT-STR
                    WS-TXN-TAIL
                    WS-SENDER-PHONE
                    WS-RECEIVER-PHONE
           END-UNSTRING.

           EVALUATE FUNCTION UPPER-CASE(FUNCTION TRIM(WS-ACTION))
               WHEN "VALIDATE_TXN"
                   PERFORM 1000-VALIDATE-TRANSACTION
               WHEN OTHER
                   DISPLAY "ERROR|Unsupported structural binary action."
           END-EVALUATE.

           STOP RUN.

       1000-VALIDATE-TRANSACTION.
           MOVE FUNCTION TRIM(WS-AMOUNT-STR) TO WS-AMOUNT-STR
           PERFORM VARYING WS-IDX FROM 1 BY 1 
                   UNTIL WS-IDX > 
                   FUNCTION LENGTH(FUNCTION TRIM(WS-AMOUNT-STR))
               IF WS-AMOUNT-STR(WS-IDX:1) < "0" OR 
                  WS-AMOUNT-STR(WS-IDX:1) > "9"
                   DISPLAY "ERROR|Transfer amount must be numeric."
                   STOP RUN
               END-IF
           END-PERFORM.

           MOVE FUNCTION NUMVAL(WS-AMOUNT-STR) TO WS-AMOUNT-NUM.

           IF WS-AMOUNT-NUM < 1000 OR WS-AMOUNT-NUM > 500000
               DISPLAY "ERROR|Amount limits (1,000 - 500,000 MMK)."
               STOP RUN
           END-IF.

           MOVE FUNCTION TRIM(WS-TXN-TAIL) TO WS-TXN-TAIL
           IF FUNCTION LENGTH(FUNCTION TRIM(WS-TXN-TAIL)) NOT = 6
               DISPLAY "ERROR|Transaction Code Tail must be 6 digits."
               STOP RUN
           END-IF.

           PERFORM VARYING WS-IDX FROM 1 BY 1 UNTIL WS-IDX > 6
               IF WS-TXN-TAIL(WS-IDX:1) < "0" OR 
                  WS-TXN-TAIL(WS-IDX:1) > "9"
                   DISPLAY "ERROR|Non-numeric characters."
                   STOP RUN
               END-IF
           END-PERFORM.

           IF FUNCTION TRIM(WS-SENDER-PHONE) = SPACES OR 
              FUNCTION TRIM(WS-RECEIVER-PHONE) = SPACES
               DISPLAY "ERROR|Sender or Receiver cannot be blank."
               STOP RUN
           END-IF.

           DISPLAY "SUCCESS|Transaction valid.".
