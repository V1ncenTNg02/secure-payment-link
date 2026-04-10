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