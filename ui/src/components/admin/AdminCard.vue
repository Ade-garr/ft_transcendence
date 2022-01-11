<template>
    <div class="card">
        <div>
            <h3>Administration</h3>
        </div>
        <form>
            <span>DELETE USER </span>
            <input type="text" v-model="username_to_delete" placeholder="Be careful.." /><br>
        </form>
        <button class="orangebutton" @click="updateProfile">Delete user</button>
        <p class="error" v-if="errorMessage != ''">{{ errorMessage }}</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'


export default defineComponent({
    props: {
        userid: {
        type: String,
        required: true
        }
    },
    data() {
        return {
            username_to_delete: '',
            errorMessage: '',
        }
    },
    methods: {

    }
})
</script>

<style scoped>


</style>
