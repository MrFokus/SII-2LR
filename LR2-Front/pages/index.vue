<template>
  <main>
    <div class="checks">
      <div v-for="(object,i_obj) in objs" class="obj">
        <p class="name">{{ object.name }}</p>
        <p v-for="(state,i_state) in object?.states"> <input @click="select(i_obj,i_state)" type="checkbox"> {{ state.result }} </p>
      </div>
    </div>
    <button @click="Send()">Отправить</button>
    <div class="result" v-if="result.length">
      <p v-for="(stage,i) in result"><span>{{i+1}})</span> {{stage}}</p>
    </div>
  </main>
</template>

<script>
export default {
  data(){
    return{
      objs:[],
      result:[],
    }
  },
  methods:{
    async getObjs(){
      this.objs = await this.$axios.$get('http://localhost:3001/')
    },
    select(o,s){
      console.log(o,s)
      if(this.objs[o].states[s].current_state===this.objs[o].states[s].result){
        this.objs[o].states[s].current_state = 'не ' + this.objs[o].states[s].result
      }
      else this.objs[o].states[s].current_state = this.objs[o].states[s].result
      console.log(this.objs[o])
    },
    async Send(){
      this.result = await this.$axios.$post('http://localhost:3001/',this.objs)
    }
  },
  mounted(){
    this.getObjs()
  },
}
</script>

<style scoped>
main{
  min-width: 100vw;
  min-height: 100vh;
  background-color: #75e900;
}
.obj{
  display: flex;
}
</style>
<style>
*{
  margin: 0;
  padding: 0;
}
.checks{
  width: fit-content;
  justify-content: center;
  font-size: 20px;
}
.obj{
  margin-bottom: 10px;
}
.obj :not(p.name){
  width: 200px;
  display: flex;
  justify-content: center;
}
.obj .name{
  width: 200px;
}
main{
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}
button{
  margin-top: 20px;
  width: 20vw;
}
.result{
  margin-top: 20px;
  width: 600px;
  font-size: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.result p{

}
</style>
