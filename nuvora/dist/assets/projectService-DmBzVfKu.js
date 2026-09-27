import{g as a,s as o}from"./index-BXa9Uyp-.js";/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=a("FolderGit2",[["path",{d:"M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v5",key:"1w6njk"}],["circle",{cx:"13",cy:"12",r:"2",key:"1j92g6"}],["path",{d:"M18 19c-2.8 0-5-2.2-5-5v8",key:"pkpw2h"}],["circle",{cx:"20",cy:"19",r:"2",key:"1obnsp"}]]);async function u(r){const{data:s,error:e}=await o.from("projects").select("*").eq("course_id",r).eq("is_published",!0).order("sort_order");if(e)throw e;return s??[]}async function d(r,s){const{data:e,error:t}=await o.from("project_submissions").select("*").eq("user_id",r).eq("project_id",s).order("created_at",{ascending:!1}).limit(1).maybeSingle();if(t)throw t;return e}async function l(r,s,e){const{data:t,error:i}=await o.from("project_submissions").insert({user_id:r,project_id:s,submission_url:e.submissionUrl.trim()||null,notes:e.notes.trim()||null,status:"submitted"}).select().single();if(i)throw i;return t}export{n as F,d as a,u as g,l as s};
