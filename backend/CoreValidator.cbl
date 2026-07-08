       IDENTIFICATION DIVISION.
       PROGRAM-ID. USERVAL.
       
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-USER-STATUS      PIC X(10).
       01  WS-IS-BLACKLISTED   PIC 9(1).
       
       LINKAGE SECTION.
       01  LK-ACTION           PIC X(10).
       01  LK-USER-STATUS      PIC X(10).
       01  LK-BLACKLIST-FLAG   PIC 9(1).
       01  LK-RESPONSE-STATUS  PIC X(5).
       01  LK-RESPONSE-MSG     PIC X(60).

       PROCEDURE DIVISION USING LK-ACTION 
                                LK-USER-STATUS 
                                LK-BLACKLIST-FLAG
                                LK-RESPONSE-STATUS 
                                LK-RESPONSE-MSG.
       MAIN-LOGIC.
           MOVE "OK" TO LK-RESPONSE-STATUS
           MOVE "ACCESS GRANTED" TO LK-RESPONSE-MSG

           IF LK-ACTION = "LOGIN" OR LK-ACTION = "TXN"
               IF LK-BLACKLIST-FLAG = 1
                   MOVE "ERROR" TO LK-RESPONSE-STATUS
                   MOVE "TERMINATED: PERMANENTLY BLACKLISTED." 
                     TO LK-RESPONSE-MSG
                   GOBACK
               END-IF

               IF LK-USER-STATUS = "Blocked"
                   MOVE "ERROR" TO LK-RESPONSE-STATUS
                   MOVE "SUSPENDED: ACCOUNT TEMPORARILY BLOCKED." 
                     TO LK-RESPONSE-MSG
                   GOBACK
               END-IF
           END-IF.

           GOBACK.
