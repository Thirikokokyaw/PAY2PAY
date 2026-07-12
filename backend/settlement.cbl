       IDENTIFICATION DIVISION.
       PROGRAM-ID. SETTLEMENT.
       AUTHOR. PEER-COLLABORATOR.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-ARGUMENTS         PIC X(150).
       01  WS-ACTION            PIC X(10).
       01  WS-AMOUNT            PIC 9(9)V99.
       01  WS-NET-RECV          PIC 9(9)V99.
       01  WS-SRC-BAL           PIC S9(9)V99.
       01  WS-TGT-BAL           PIC S9(9)V99.
       
       01  WS-UNPARSED-AMT      PIC X(12).
       01  WS-UNPARSED-RECV     PIC X(12).
       01  WS-UNPARSED-SRC      PIC X(12).
       01  WS-UNPARSED-TGT      PIC X(12).

       PROCEDURE DIVISION.
       MAIN-PROCEDURE.
           ACCEPT WS-ARGUMENTS FROM COMMAND-LINE.
           
           UNSTRING WS-ARGUMENTS DELIMITED BY ","
               INTO WS-ACTION
                    WS-UNPARSED-AMT
                    WS-UNPARSED-RECV
                    WS-UNPARSED-SRC
                    WS-UNPARSED-TGT
           END-UNSTRING.

           COMPUTE WS-AMOUNT = FUNCTION NUMVAL(WS-UNPARSED-AMT).
           COMPUTE WS-NET-RECV = FUNCTION NUMVAL(WS-UNPARSED-RECV).
           COMPUTE WS-SRC-BAL = FUNCTION NUMVAL(WS-UNPARSED-SRC).
           COMPUTE WS-TGT-BAL = FUNCTION NUMVAL(WS-UNPARSED-TGT).

           EVALUATE FUNCTION TRIM(WS-ACTION)
               WHEN "APPROVE"
                   *> Add funds to the target wallet on successful checkout
                   SUBTRACT WS-NET-RECV FROM WS-TGT-BAL
                   DISPLAY "SUCCESS|" WS-SRC-BAL "|" WS-TGT-BAL

               WHEN "CANCEL"
                   *> Refund funds back to the source wallet on cancellation
                   SUBTRACT WS-AMOUNT FROM WS-SRC-BAL
                   DISPLAY "SUCCESS|" WS-SRC-BAL "|" WS-TGT-BAL

               WHEN OTHER
                   DISPLAY "ERROR|Invalid settlement action"
           END-EVALUATE.

           STOP RUN.
