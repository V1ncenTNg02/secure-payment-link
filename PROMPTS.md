# Prompt 1: 

This is the test I need to work on, help me 1. find necessary .claude file online, find the best practices, and build the .claude folder first, and 2. Re-oraganize this code test file into a BRD in the structure: 1. Title 2. Requiremetns and use cases, 3. Technical designs 4. steps breakdown, 5. Acceptence criteria 6. a detailed to do list

# Prompt 2:

Answer the following questions:

1. How is the security ensured? Is there any verification performed to prevent that if a man in the middle gets the link, he cannot get the money without verification?

2. Does the document mentioned whether the deployment is needed?

3. Add the rules for DB, security, and if deployment is needed, add one more rule for infra 

4. add a rule that there should be a file storing all changes made by claude, called change_log.  the updating of this file should be enforced. The Structrure of each entry should be: Change name, chanage time, change type, change summary (comparison between the old logic and new logic).

5. Add a readme file called Decision to store all technical decision made, each record should have: time, decision code, title, status, context, alternative considered, consequences. Updates should be enforced when there is an architectural decision made.

# Prompt 3:

1. Don't remove the change log folder and update the changelog and decisions files in it. 

2. Add a rule to enforce test driven development workflow. Tests should be written before any code is developed.

3. update the files to make the flow as: when the person makes a payment, he needs to enter a one-time 6 digits pin, then the link will be genereated. When the receiver wants to accept the payment with the link, he needs to enter the pin (which should be told over the phone)

# Prompt 4: 
Help me check if the DB migration rule has been set so when there is a change on the DB Side, write a sql file like 000_db_change_name.sql

# Prompt 5:
Now help me build the app step by step, stop every time one task is finished. Ask me if you have any questions or something want me to clarify, one at a time

# Prompt 6:
it is in the env file with below attributes

DATABASE_URL=postgresql://postgres.tikgcymimmlmvaxnzisy:..@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres

DB_HOST=aws-1-ap-southeast-2.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.tikgcymimmlmvaxnzisy
DB_PASSWORD=...

# Prompt 7: 

please help me to do the next task

# Prompt 8:

Please do task 5 first and then do task 4

# Prompt 9:

Do task 6 please

# Prompt 10: 

Help me revise the frontend to align with the design style, and update the component in following steps: 1. When card is selected, add fields to capture card number, Expire date, and CVC; if bank transfer is selected, capture Account Number and BSB; add one more option for Apple Pay, if Apple pay is selected, show a button showing Apple Pay. 2. add more regions in the region selection, 3.Remove the pin placeholder, and change the input field to 6 continous blank squares, like the OTP design.

# Prompt 11: 

Help me change the Red color for the border of payment method selection, mask, and generate link button to focus blue and link blue in the design file. 

and fix two issues for me: 1. center the Pin input field 2. Once I type a number in the first block, the pointer should jump to the next block

# Prompt 12:
Remove the third payment option

# Prompt 13:
once the generate link button is clicked, show two options 1. Copy link 2. Send link to an email address, and put a email input field besides it. Once the send button is clicked, show: Link sent successfully! No need to implement the send functionality, just implement the UI.

# Prompt 14:
Help me do task 7