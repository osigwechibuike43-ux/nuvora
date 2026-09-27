-- ============================================================
-- NUVORA — seed data (real, working content, not placeholders)
-- ============================================================

insert into nuvora.skill_categories (name, slug, description, icon, sort_order) values
  ('Technology', 'technology', 'Programming, data, cloud, and AI skills', 'cpu', 1),
  ('Business', 'business', 'Entrepreneurship, marketing, sales, and management', 'briefcase', 2),
  ('Creative', 'creative', 'Design, writing, and content creation', 'palette', 3),
  ('Professional', 'professional', 'Communication, leadership, and career skills', 'target', 4);

insert into nuvora.skills (category_id, name, slug, description, icon, sort_order)
select c.id, s.name, s.slug, s.description, s.icon, s.sort_order
from nuvora.skill_categories c
join (values
  ('technology','HTML','html','Structure the web with semantic markup','code',1),
  ('technology','CSS','css','Style and layout modern interfaces','code',2),
  ('technology','JavaScript','javascript','The language of the web','code',3),
  ('technology','TypeScript','typescript','JavaScript with static types','code',4),
  ('technology','React','react','Build modern user interfaces','code',5),
  ('technology','Node.js','nodejs','Server-side JavaScript','server',6),
  ('technology','Python','python','General-purpose programming for automation, data, and AI','code',7),
  ('technology','SQL & Databases','sql-databases','Query and design relational databases','database',8),
  ('technology','Cybersecurity','cybersecurity','Protect systems and data','shield',9),
  ('technology','Cloud','cloud','Deploy and scale applications','cloud',10),
  ('technology','AI & Machine Learning','ai-machine-learning','Build and apply AI systems','brain',11),
  ('technology','Data Analysis','data-analysis','Turn data into decisions','bar-chart',12),
  ('business','Entrepreneurship','entrepreneurship','Start and grow a business','rocket',1),
  ('business','Marketing','marketing','Reach and grow an audience','megaphone',2),
  ('business','Sales','sales','Sell effectively and build pipeline','trending-up',3),
  ('business','Finance','finance','Manage money and make financial decisions','dollar-sign',4),
  ('business','Product Management','product-management','Build products people want','layers',5),
  ('creative','UI/UX Design','ui-ux-design','Design usable, beautiful products','figma',1),
  ('creative','Graphic Design','graphic-design','Visual communication and branding','image',2),
  ('creative','Writing','writing','Communicate clearly in writing','pen-tool',3),
  ('creative','Video Editing','video-editing','Tell stories through video','video',4),
  ('professional','Communication','communication','Speak and write with clarity and impact','message-circle',1),
  ('professional','Public Speaking','public-speaking','Present with confidence','mic',2),
  ('professional','Leadership','leadership','Lead teams and projects effectively','users',3),
  ('professional','Critical Thinking','critical-thinking','Reason clearly and solve problems','lightbulb',4)
) as s(category_slug, name, slug, description, icon, sort_order)
on c.slug = s.category_slug;

insert into nuvora.learning_paths (skill_id, title, slug, description, level, is_published, sort_order)
select id, 'JavaScript Fundamentals', 'javascript-fundamentals',
  'Go from zero to confidently writing real JavaScript programs.', 'beginner', true, 1
from nuvora.skills where slug = 'javascript';

insert into nuvora.courses (learning_path_id, title, slug, description, level, estimated_hours, is_published, sort_order)
select id, 'JavaScript Fundamentals', 'javascript-fundamentals-course',
  'Variables, functions, control flow, and the building blocks of JavaScript.', 'beginner', 6, true, 1
from nuvora.learning_paths where slug = 'javascript-fundamentals';

insert into nuvora.course_modules (course_id, title, description, sort_order)
select id, 'Getting Started', 'Set up your environment and write your first program.', 1
from nuvora.courses where slug = 'javascript-fundamentals-course';

insert into nuvora.lessons (module_id, title, slug, lesson_type, content, estimated_minutes, sort_order, is_published)
select m.id, l.title, l.slug, l.lesson_type, l.content::jsonb, l.estimated_minutes, l.sort_order, true
from nuvora.course_modules m
join (values
  ('Why JavaScript?','why-javascript','text','{"blocks":[{"type":"paragraph","text":"JavaScript is the language that runs in every web browser, and now on servers too. It lets you build interactive websites, apps, and even AI-powered tools."}]}',8,1),
  ('Variables & Data Types','variables-data-types','text','{"blocks":[{"type":"paragraph","text":"Variables store values so your program can use them later. JavaScript has strings, numbers, booleans, arrays, and objects."},{"type":"code","language":"javascript","code":"let name = \"Ada\";\nconst age = 28;\nlet isLearning = true;"}]}',12,2),
  ('Your First Quiz','first-quiz','quiz','{"blocks":[{"type":"paragraph","text":"Quick check: let''s see how well the last two lessons stuck."}]}',5,3)
) as l(title, slug, lesson_type, content, estimated_minutes, sort_order)
on m.title = 'Getting Started';

insert into nuvora.quiz_questions (lesson_id, question_text, question_type, explanation, sort_order)
select l.id, q.question_text, q.question_type, q.explanation, q.sort_order
from nuvora.lessons l
join (values
  ('Which keyword declares a variable that cannot be reassigned?','single_choice','const creates a binding that cannot be reassigned. let and var can both be reassigned.',1),
  ('What data type is `true`?','single_choice','true and false are boolean values in JavaScript.',2)
) as q(question_text, question_type, explanation, sort_order)
on l.slug = 'first-quiz';

insert into nuvora.quiz_options (question_id, option_text, is_correct, sort_order)
select qq.id, o.option_text, o.is_correct, o.sort_order
from nuvora.quiz_questions qq
join nuvora.lessons l on l.id = qq.lesson_id and l.slug = 'first-quiz'
join (values
  ('Which keyword declares a variable that cannot be reassigned?','let',false,1),
  ('Which keyword declares a variable that cannot be reassigned?','var',false,2),
  ('Which keyword declares a variable that cannot be reassigned?','const',true,3),
  ('What data type is `true`?','string',false,1),
  ('What data type is `true`?','boolean',true,2),
  ('What data type is `true`?','number',false,3)
) as o(question_text, option_text, is_correct, sort_order)
on qq.question_text = o.question_text;

insert into nuvora.projects (course_id, title, description, requirements, is_published, sort_order)
select c.id,
  'Build a Task Manager',
  'Apply what you learned in JavaScript Fundamentals by building a small, working task manager in the browser.',
  array['Add and remove tasks via the DOM', 'Persist tasks with localStorage', 'A form with basic validation (no empty tasks)', 'Handle click and submit events correctly'],
  true, 1
from nuvora.courses c where c.slug = 'javascript-fundamentals-course';

insert into nuvora.careers (title, slug, description, sort_order) values
  ('Frontend Developer', 'frontend-developer', 'Build the interfaces people use directly in the browser.', 1);

insert into nuvora.career_skills (career_id, skill_id, sort_order)
select c.id, s.id, ord.sort_order
from nuvora.careers c
join (values ('html',1), ('css',2), ('javascript',3), ('typescript',4), ('react',5)) as ord(skill_slug, sort_order) on true
join nuvora.skills s on s.slug = ord.skill_slug
where c.slug = 'frontend-developer';

-- ---------- additional modules for JavaScript Fundamentals ----------
insert into nuvora.course_modules (course_id, title, description, sort_order)
select id, 'Functions', 'Write reusable blocks of logic.', 2
from nuvora.courses where slug = 'javascript-fundamentals-course';

insert into nuvora.lessons (module_id, title, slug, lesson_type, content, estimated_minutes, sort_order, is_published)
select m.id, l.title, l.slug, l.lesson_type, l.content::jsonb, l.estimated_minutes, l.sort_order, true
from nuvora.course_modules m
join (values
  ('Writing Your First Function','writing-your-first-function','text',
   '{"blocks":[
     {"type":"paragraph","text":"A function is a reusable block of code that performs a task. Instead of repeating the same lines over and over, you write them once inside a function, then call that function whenever you need it."},
     {"type":"code","language":"javascript","code":"function greet(name) {\n  return \"Hello, \" + name + \"!\";\n}\n\nconsole.log(greet(\"Ada\")); // \"Hello, Ada!\"\nconsole.log(greet(\"Sam\")); // \"Hello, Sam!\""},
     {"type":"paragraph","text":"greet is the function name. name is a parameter — a placeholder for a value you will provide later. \"Ada\" and \"Sam\" are arguments — the actual values passed in when the function is called."},
     {"type":"callout","text":"A function only runs when it is called. Defining it just teaches JavaScript what to do — it does not execute anything by itself."}
   ]}', 10, 1),
  ('Parameters, Arguments, and Return Values','parameters-arguments-return-values','text',
   '{"blocks":[
     {"type":"paragraph","text":"Functions can take multiple parameters, and they can send a value back to whoever called them using the return keyword."},
     {"type":"code","language":"javascript","code":"function add(a, b) {\n  return a + b;\n}\n\nconst total = add(4, 7);\nconsole.log(total); // 11"},
     {"type":"paragraph","text":"Once return runs, the function stops immediately — any code after it inside that function will not execute. If a function has no return statement, it returns undefined by default."},
     {"type":"list","items":["Parameters are named in the function definition","Arguments are the real values passed when calling it","return sends a value back and ends the function"]}
   ]}', 10, 2),
  ('Arrow Functions','arrow-functions','text',
   '{"blocks":[
     {"type":"paragraph","text":"Arrow functions are a shorter way to write functions, introduced in modern JavaScript. They are especially common for short, one-off functions."},
     {"type":"code","language":"javascript","code":"// Traditional function\nfunction square(n) {\n  return n * n;\n}\n\n// Arrow function, same behavior\nconst squareArrow = (n) => {\n  return n * n;\n};\n\n// Arrow function, implicit return (no braces needed)\nconst squareShort = (n) => n * n;\n\nconsole.log(squareShort(5)); // 25"},
     {"type":"paragraph","text":"When an arrow function''s body is a single expression, you can omit the braces and the return keyword — the value of that expression is returned automatically."}
   ]}', 8, 3),
  ('Functions Quiz','functions-quiz','quiz',
   '{"blocks":[{"type":"paragraph","text":"Check your understanding of functions before moving on."}]}', 5, 4)
) as l(title, slug, lesson_type, content, estimated_minutes, sort_order)
on m.title = 'Functions' and m.course_id = (select id from nuvora.courses where slug = 'javascript-fundamentals-course');

insert into nuvora.quiz_questions (lesson_id, question_text, question_type, explanation, sort_order)
select l.id, q.question_text, q.question_type, q.explanation, q.sort_order
from nuvora.lessons l
join nuvora.course_modules m on m.id = l.module_id and m.title = 'Functions'
join (values
  ('What keyword sends a value back from a function?','single_choice','return exits the function and sends the given value back to the caller.',1),
  ('What does a function return if it has no return statement?','single_choice','A function without a return statement implicitly returns undefined.',2)
) as q(question_text, question_type, explanation, sort_order)
on l.slug = 'functions-quiz';

insert into nuvora.quiz_options (question_id, option_text, is_correct, sort_order)
select qq.id, o.option_text, o.is_correct, o.sort_order
from nuvora.quiz_questions qq
join nuvora.lessons l on l.id = qq.lesson_id and l.slug = 'functions-quiz'
join (values
  ('What keyword sends a value back from a function?','end',false,1),
  ('What keyword sends a value back from a function?','return',true,2),
  ('What keyword sends a value back from a function?','output',false,3),
  ('What does a function return if it has no return statement?','null',false,1),
  ('What does a function return if it has no return statement?','0',false,2),
  ('What does a function return if it has no return statement?','undefined',true,3)
) as o(question_text, option_text, is_correct, sort_order)
on qq.question_text = o.question_text;

insert into nuvora.course_modules (course_id, title, description, sort_order)
select id, 'Arrays & Objects', 'Store and organize collections of data.', 3
from nuvora.courses where slug = 'javascript-fundamentals-course';

insert into nuvora.lessons (module_id, title, slug, lesson_type, content, estimated_minutes, sort_order, is_published)
select m.id, l.title, l.slug, l.lesson_type, l.content::jsonb, l.estimated_minutes, l.sort_order, true
from nuvora.course_modules m
join (values
  ('Working with Arrays','working-with-arrays','text',
   '{"blocks":[
     {"type":"paragraph","text":"An array is an ordered list of values. You access items by their position, called an index, starting from 0."},
     {"type":"code","language":"javascript","code":"const fruits = [\"apple\", \"banana\", \"cherry\"];\n\nconsole.log(fruits[0]); // \"apple\"\nconsole.log(fruits.length); // 3\n\nfruits.push(\"date\"); // adds to the end\nfruits.pop(); // removes the last item"},
     {"type":"paragraph","text":"Arrays are one of the most-used data structures in JavaScript — task lists, search results, and form fields are all commonly stored as arrays."}
   ]}', 10, 1),
  ('Array Methods: map, filter, forEach','array-methods-map-filter-foreach','text',
   '{"blocks":[
     {"type":"paragraph","text":"Arrays come with built-in methods for transforming and inspecting data without writing manual loops."},
     {"type":"code","language":"javascript","code":"const numbers = [1, 2, 3, 4, 5];\n\nconst doubled = numbers.map((n) => n * 2);\n// [2, 4, 6, 8, 10]\n\nconst evens = numbers.filter((n) => n % 2 === 0);\n// [2, 4]\n\nnumbers.forEach((n) => console.log(n));\n// logs each number, one per line"},
     {"type":"list","items":["map() transforms every item and returns a new array","filter() keeps only items that pass a test","forEach() runs code for each item but returns nothing"]}
   ]}', 12, 2),
  ('Objects & Properties','objects-and-properties','text',
   '{"blocks":[
     {"type":"paragraph","text":"An object stores data as key-value pairs. Where arrays use numeric positions, objects use named properties."},
     {"type":"code","language":"javascript","code":"const user = {\n  name: \"Ada\",\n  age: 28,\n  isLearning: true,\n};\n\nconsole.log(user.name); // \"Ada\"\nuser.age = 29; // update a property\nuser.email = \"ada@example.com\"; // add a new property"},
     {"type":"paragraph","text":"Objects are how you model real things in code — a user, a product, a lesson — grouping related data together under one variable."}
   ]}', 10, 3),
  ('Arrays & Objects Quiz','arrays-objects-quiz','quiz',
   '{"blocks":[{"type":"paragraph","text":"Check your understanding before moving on."}]}', 5, 4)
) as l(title, slug, lesson_type, content, estimated_minutes, sort_order)
on m.title = 'Arrays & Objects' and m.course_id = (select id from nuvora.courses where slug = 'javascript-fundamentals-course');

insert into nuvora.quiz_questions (lesson_id, question_text, question_type, explanation, sort_order)
select l.id, q.question_text, q.question_type, q.explanation, q.sort_order
from nuvora.lessons l
join nuvora.course_modules m on m.id = l.module_id and m.title = 'Arrays & Objects'
join (values
  ('What index does the first item in an array have?','single_choice','JavaScript arrays are zero-indexed, so the first item is at index 0.',1),
  ('Which array method returns a new array with only items that pass a test?','single_choice','filter() tests each item and keeps only the ones that return true.',2)
) as q(question_text, question_type, explanation, sort_order)
on l.slug = 'arrays-objects-quiz';

insert into nuvora.quiz_options (question_id, option_text, is_correct, sort_order)
select qq.id, o.option_text, o.is_correct, o.sort_order
from nuvora.quiz_questions qq
join nuvora.lessons l on l.id = qq.lesson_id and l.slug = 'arrays-objects-quiz'
join (values
  ('What index does the first item in an array have?','0',true,1),
  ('What index does the first item in an array have?','1',false,2),
  ('What index does the first item in an array have?','-1',false,3),
  ('Which array method returns a new array with only items that pass a test?','map()',false,1),
  ('Which array method returns a new array with only items that pass a test?','filter()',true,2),
  ('Which array method returns a new array with only items that pass a test?','forEach()',false,3)
) as o(question_text, option_text, is_correct, sort_order)
on qq.question_text = o.question_text;

insert into nuvora.course_modules (course_id, title, description, sort_order)
select id, 'Control Flow', 'Make decisions and repeat actions in your code.', 4
from nuvora.courses where slug = 'javascript-fundamentals-course';

insert into nuvora.lessons (module_id, title, slug, lesson_type, content, estimated_minutes, sort_order, is_published)
select m.id, l.title, l.slug, l.lesson_type, l.content::jsonb, l.estimated_minutes, l.sort_order, true
from nuvora.course_modules m
join (values
  ('If, Else, and Comparisons','if-else-and-comparisons','text',
   '{"blocks":[
     {"type":"paragraph","text":"Programs need to make decisions. if statements run code only when a condition is true."},
     {"type":"code","language":"javascript","code":"const age = 20;\n\nif (age >= 18) {\n  console.log(\"You can vote.\");\n} else {\n  console.log(\"Not old enough yet.\");\n}"},
     {"type":"paragraph","text":"Comparisons like ===, !==, >, and < produce true or false. Always prefer === over == — it checks both value and type, avoiding surprising automatic conversions."}
   ]}', 10, 1),
  ('Loops: for and while','loops-for-and-while','text',
   '{"blocks":[
     {"type":"paragraph","text":"Loops repeat a block of code multiple times, so you do not have to write it out manually."},
     {"type":"code","language":"javascript","code":"for (let i = 0; i < 3; i++) {\n  console.log(\"Iteration\", i);\n}\n\nlet count = 0;\nwhile (count < 3) {\n  console.log(\"Count is\", count);\n  count++;\n}"},
     {"type":"paragraph","text":"A for loop is best when you know how many times to repeat. A while loop is best when you repeat until a condition changes, and you do not know exactly how many times that will take."}
   ]}', 10, 2),
  ('Control Flow Quiz','control-flow-quiz','quiz',
   '{"blocks":[{"type":"paragraph","text":"Check your understanding before moving on."}]}', 5, 3)
) as l(title, slug, lesson_type, content, estimated_minutes, sort_order)
on m.title = 'Control Flow' and m.course_id = (select id from nuvora.courses where slug = 'javascript-fundamentals-course');

insert into nuvora.quiz_questions (lesson_id, question_text, question_type, explanation, sort_order)
select l.id, q.question_text, q.question_type, q.explanation, q.sort_order
from nuvora.lessons l
join nuvora.course_modules m on m.id = l.module_id and m.title = 'Control Flow'
join (values
  ('Which comparison operator checks both value and type?','single_choice','=== is the strict equality operator: it checks value and type, with no automatic conversion.',1),
  ('Which loop is best when you don''t know how many times you''ll repeat?','single_choice','while loops repeat based on a condition, which is ideal when the number of repeats isn''t known in advance.',2)
) as q(question_text, question_type, explanation, sort_order)
on l.slug = 'control-flow-quiz';

insert into nuvora.quiz_options (question_id, option_text, is_correct, sort_order)
select qq.id, o.option_text, o.is_correct, o.sort_order
from nuvora.quiz_questions qq
join nuvora.lessons l on l.id = qq.lesson_id and l.slug = 'control-flow-quiz'
join (values
  ('Which comparison operator checks both value and type?','==',false,1),
  ('Which comparison operator checks both value and type?','===',true,2),
  ('Which comparison operator checks both value and type?','=',false,3),
  ('Which loop is best when you don''t know how many times you''ll repeat?','for',false,1),
  ('Which loop is best when you don''t know how many times you''ll repeat?','while',true,2),
  ('Which loop is best when you don''t know how many times you''ll repeat?','switch',false,3)
) as o(question_text, option_text, is_correct, sort_order)
on qq.question_text = o.question_text;

insert into nuvora.course_modules (course_id, title, description, sort_order)
select id, 'The DOM', 'Make your page interactive by reading and changing what''s on screen.', 5
from nuvora.courses where slug = 'javascript-fundamentals-course';

insert into nuvora.lessons (module_id, title, slug, lesson_type, content, estimated_minutes, sort_order, is_published)
select m.id, l.title, l.slug, l.lesson_type, l.content::jsonb, l.estimated_minutes, l.sort_order, true
from nuvora.course_modules m
join (values
  ('Selecting Elements','selecting-elements','text',
   '{"blocks":[
     {"type":"paragraph","text":"The DOM (Document Object Model) is how JavaScript sees and controls the HTML on a page. Before you can change something, you need to select it."},
     {"type":"code","language":"javascript","code":"const heading = document.querySelector(\"h1\");\nconst allButtons = document.querySelectorAll(\"button\");\n\nconsole.log(heading.textContent);"},
     {"type":"paragraph","text":"querySelector returns the first matching element. querySelectorAll returns every match, as a list you can loop over."}
   ]}', 10, 1),
  ('Handling Events','handling-events','text',
   '{"blocks":[
     {"type":"paragraph","text":"Events let your code react to what the user does — clicking, typing, submitting a form."},
     {"type":"code","language":"javascript","code":"const button = document.querySelector(\"#save-btn\");\n\nbutton.addEventListener(\"click\", () => {\n  console.log(\"Button was clicked!\");\n});"},
     {"type":"paragraph","text":"addEventListener takes the event type (like \"click\" or \"submit\") and a function to run when it happens. This is the foundation of every interactive web page."}
   ]}', 10, 2),
  ('Updating the Page','updating-the-page','text',
   '{"blocks":[
     {"type":"paragraph","text":"Once you have selected an element, you can change its text, its styles, or create entirely new elements."},
     {"type":"code","language":"javascript","code":"const list = document.querySelector(\"#task-list\");\n\nconst item = document.createElement(\"li\");\nitem.textContent = \"Learn the DOM\";\nlist.appendChild(item);"},
     {"type":"callout","text":"This is exactly the pattern your practice project will use: create an element, set its content, and add it to the page."}
   ]}', 10, 3),
  ('The DOM Quiz','the-dom-quiz','quiz',
   '{"blocks":[{"type":"paragraph","text":"Last check before the practice project."}]}', 5, 4)
) as l(title, slug, lesson_type, content, estimated_minutes, sort_order)
on m.title = 'The DOM' and m.course_id = (select id from nuvora.courses where slug = 'javascript-fundamentals-course');

insert into nuvora.quiz_questions (lesson_id, question_text, question_type, explanation, sort_order)
select l.id, q.question_text, q.question_type, q.explanation, q.sort_order
from nuvora.lessons l
join nuvora.course_modules m on m.id = l.module_id and m.title = 'The DOM'
join (values
  ('Which method selects the FIRST matching element?','single_choice','querySelector returns only the first element that matches the given selector.',1),
  ('What do you call to run code when a button is clicked?','single_choice','addEventListener registers a function to run when the specified event occurs.',2)
) as q(question_text, question_type, explanation, sort_order)
on l.slug = 'the-dom-quiz';

insert into nuvora.quiz_options (question_id, option_text, is_correct, sort_order)
select qq.id, o.option_text, o.is_correct, o.sort_order
from nuvora.quiz_questions qq
join nuvora.lessons l on l.id = qq.lesson_id and l.slug = 'the-dom-quiz'
join (values
  ('Which method selects the FIRST matching element?','querySelectorAll',false,1),
  ('Which method selects the FIRST matching element?','querySelector',true,2),
  ('Which method selects the FIRST matching element?','getAll',false,3),
  ('What do you call to run code when a button is clicked?','onClick()',false,1),
  ('What do you call to run code when a button is clicked?','addEventListener()',true,2),
  ('What do you call to run code when a button is clicked?','runOnClick()',false,3)
) as o(question_text, option_text, is_correct, sort_order)
on qq.question_text = o.question_text;
