       IDENTIFICATION DIVISION.
       PROGRAM-ID. APPROVE-TRANSACTION.

       ENVIRONMENT DIVISION.
    
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-CMD-ARGS          PIC X(255).
       01  WS-ACTION            PIC X(20).
       01  WS-AMOUNT-STR        PIC X(15).
       01  WS-TXN-TAIL          PIC X(10).
       01  WS-SENDER            PIC X(20).
       01  WS-RECEIVER          PIC X(20).
       01  WS-AMOUNT-NUM        PIC 9(9).
       01  WS-IDX               PIC 9(3).

       PROCEDURE DIVISION.
       0000-MAIN.
           DISPLAY " " UPON COMMAND-LINE
           ACCEPT WS-CMD-ARGS FROM COMMAND-LINE

           IF WS-CMD-ARGS = SPACES
               DISPLAY "ERROR|No transaction provided for approval."
               STOP RUN
           END-IF.

           UNSTRING WS-CMD-ARGS DELIMITED BY ","
               INTO WS-ACTION
                    WS-AMOUNT-STR
                    WS-TXN-TAIL
                    WS-SENDER
                    WS-RECEIVER
           END-UNSTRING.

           EVALUATE FUNCTION UPPER-CASE(FUNCTION TRIM(WS-ACTION))
               WHEN "APPROVE"
                   PERFORM 1000-PROCESS-APPROVAL
               WHEN OTHER
                   DISPLAY "ERROR|Invalid approval module."
           END-EVALUATE.

           STOP RUN.

       1000-PROCESS-APPROVAL.
           MOVE FUNCTION TRIM(WS-AMOUNT-STR) TO WS-AMOUNT-STR
           PERFORM VARYING WS-IDX FROM 1 BY 1 
                   UNTIL WS-IDX > 
                   FUNCTION LENGTH(FUNCTION TRIM(WS-AMOUNT-STR))
               IF WS-AMOUNT-STR(WS-IDX:1) < "0" OR 
                  WS-AMOUNT-STR(WS-IDX:1) > "9"
                   DISPLAY "ERROR|Approval rejection: must be numeric."
                   STOP RUN
               END-IF
           END-PERFORM.

           MOVE FUNCTION NUMVAL(WS-AMOUNT-STR) TO WS-AMOUNT-NUM.

           IF WS-AMOUNT-NUM <= 0
               DISPLAY "ERROR|Approval rejection: Invalid  amount."
               STOP RUN
           END-IF.

           IF FUNCTION TRIM(WS-TXN-TAIL) = SPACES
               DISPLAY "ERROR|Approval rejection: Transaction  missing."
               STOP RUN
           END-IF.

           DISPLAY "SUCCESS|Transaction verified and authorized.".
           