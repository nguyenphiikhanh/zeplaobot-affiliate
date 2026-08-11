<template>
  <div class="tinymce-wrapper border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs bg-white dark:bg-slate-900">
    <Editor
      :api-key="apiKey"
      license-key="gpl"
      :init="editorConfig"
      :model-value="modelValue"
      @update:model-value="(val: string) => $emit('update:modelValue', val)"
      ref="editorRef"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Editor from '@tinymce/tinymce-vue';

// Import TinyMCE core & icons/themes/models
import 'tinymce/tinymce';
import 'tinymce/models/dom';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';

// Import TinyMCE plugins
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/help';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/emoticons/js/emojis';

// Import skin CSS directly for offline self-hosted mode
import 'tinymce/skins/ui/oxide/skin.css';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    apiKey?: string;
    height?: number;
  }>(),
  {
    apiKey: 'no-api-key',
    height: 520,
  }
);

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const editorRef = ref();

const editorConfig = {
  height: props.height,
  menubar: false,
  skin: false,
  content_css: false,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
    'emoticons'
  ],
  toolbar:
    'undo redo | blocks fontsize | bold italic forecolor backcolor | ' +
    'alignleft aligncenter alignright | bullist numlist | ' +
    'link image media table | removeformat code preview fullscreen',
  content_style:
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; padding: 16px; background-color: #ffffff; }',
  branding: false,
  promotion: false,
  resize: true,
  elementpath: true,
};

const insertContent = (content: string) => {
  if (editorRef.value && editorRef.value.editor) {
    editorRef.value.editor.insertContent(content);
  }
};

defineExpose({
  insertContent,
  editorRef,
});
</script>

<style scoped>
.tinymce-wrapper :deep(.tox-tinymce) {
  border: none !important;
  border-radius: 1rem !important;
}
</style>
