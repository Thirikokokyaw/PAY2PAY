       IDENTIFICATION DIVISION.
       PROGRAM-ID. AUTH-VALIDATOR.

       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-INPUT-DATA.
           05 WS-ACTION       PIC X(10) VALUE SPACES.
           05 WS-NAME         PIC X(50) VALUE SPACES.
           05 WS-PHONE        PIC X(15) VALUE SPACES.
           05 WS-EMAIL        PIC X(50) VALUE SPACES.
           05 WS-PASSWORD     PIC X(50) VALUE SPACES.
       
       01  WS-COUNTERS.
           05 I               PIC 9(3) VALUE 1.
           05 J               PIC 9(3) VALUE 1.
           05 PHONE-LEN       PIC 9(2) VALUE 0.
           05 AT-POS          PIC 9(2) VALUE 0.
           05 DOT-POS         PIC 9(2) VALUE 0.

       01  WS-RESPONSE.
           05 WS-STATUS       PIC X(5) VALUE 'VALID'.
           05 WS-MSG          PIC X(100) VALUE 'SUCCESS'.

       01  WS-ARG-STRING      PIC X(200) VALUE SPACES.

       PROCEDURE DIVISION.
       MAIN-PROCEDURE.
           ACCEPT WS-ARG-STRING FROM COMMAND-LINE.

           UNSTRING WS-ARG-STRING DELIMITED BY ','
               INTO WS-ACTION WS-NAME WS-PHONE WS-EMAIL WS-PASSWORD.

           PERFORM VARYING I FROM 1 BY 1 UNTIL I > 50
               IF WS-NAME(I:1) > X"7F" OR 
                  WS-EMAIL(I:1) > X"7F"
                   MOVE 'ERROR' TO WS-STATUS
                   MOVE 'Japanese characters are not allowed.' TO WS-MSG
                   PERFORM DISPLAY-AND-EXIT
               END-IF
           END-PERFORM.

           IF WS-ACTION = 'REGISTER'
               MOVE 0 TO PHONE-LEN
               PERFORM VARYING I FROM 1 BY 1 UNTIL I > 15
                   IF WS-PHONE(I:1) NOT = SPACE AND 
                      WS-PHONE(I:1) NOT = LOW-VALUES
                       ADD 1 TO PHONE-LEN
                   END-IF
               END-PERFORM
               
               IF PHONE-LEN NOT = 10 AND PHONE-LEN NOT = 11
                   MOVE 'ERROR' TO WS-STATUS
                   MOVE 'Phone number must be 10 or 11 digits.' 
                       TO WS-MSG
                   PERFORM DISPLAY-AND-EXIT
               END-IF

               PERFORM VARYING I FROM 1 BY 1 UNTIL I > 49
                   IF WS-EMAIL(I:2) = '@.' OR WS-EMAIL(I:2) = '.@'
                       MOVE 'ERROR' TO WS-STATUS
                       MOVE 'Invalid Email: @ and . cannot be adjacent.' 
                           TO WS-MSG
                       PERFORM DISPLAY-AND-EXIT
                   END-IF
               END-PERFORM
               
               MOVE 0 TO AT-POS
               MOVE 0 TO DOT-POS
               PERFORM VARYING I FROM 1 BY 1 UNTIL I > 50
                   IF WS-EMAIL(I:1) = '@'
                       MOVE I TO AT-POS
                   END-IF
                   IF WS-EMAIL(I:1) = '.'
                       MOVE I TO DOT-POS
                   END-IF
               END-PERFORM
               
               IF AT-POS = 0 OR DOT-POS = 0
                   MOVE 'ERROR' TO WS-STATUS
                   MOVE 'Email must contain both @ and . symbols.' 
                       TO WS-MSG
                   PERFORM DISPLAY-AND-EXIT
               END-IF
           END-IF.

           PERFORM DISPLAY-AND-EXIT.

       DISPLAY-AND-EXIT.
           DISPLAY FUNCTION TRIM(WS-STATUS) '|' 
                   FUNCTION TRIM(WS-MSG).
           STOP RUN.
