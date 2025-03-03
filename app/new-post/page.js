import { createPost } from "@/actions/posts";
import FormPost from "@/components/form-post";

export default async function NewPostPage() {
  return <FormPost createPost={createPost} />;
}
