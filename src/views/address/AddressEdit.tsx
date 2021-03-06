import { defineComponent, ref, reactive, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { Form, Field, NavBar, Button, Dialog } from "vant";
import { openLoading, closeLoading, toast } from '@/components/Loading';
import { getLocalStorage, setLocalStorage } from '@/utils/storage';
import CityPicker from "@/components/city-picker"

export default defineComponent({
  setup() {
    const router = useRouter()
    const store = useStore()

    const cityPicker = ref()
    const vanForm = ref()

    let form = reactive({
      id: Date.now(),
      name: '',
      tel: '',
      address: '',
      ads: '',
      city: []
    })

    const patterns = {
      phone: /^1[0-9]{10}$/,
      name: /^[\u4e00-\u9fa5]{2,20}$/,
      ads: /^[\u4E00-\u9FA5A-Za-z0-9_—()（）-]+$/
    }

    const messages = {
      phone: (val: string) => {
        if (val === '') return '请输入手机号'
        return '手机号不正确'
      },
      name: (val: string) => {
        if (val === '') return '请输入姓名'
        return '姓名输入有误'
      },
      ads: (val: string) => {
        if (val === '') return '请输入详细地址'
        return '详细地址输入有误'
      }
    }

    const selectAddress = computed(() => store.state.selectAddress)

    const cityValue = computed(() => {
      if (form.city.length > 0) return form.city.join(' ')
      return ''
    })

    const openCity = () => {
      cityPicker.value.open()
    }

    const routerBack = () => {
      router.back()
    }

    const onSubmit = () => {
      vanForm.value.validate().then(() => {
        openLoading('正在保存');
        console.log('submit', form);
        const addressList = getLocalStorage('addressList');
        if (addressList && Array.isArray(addressList)) {
          form.address = form.city.join('') + form.ads
          addressList.push(form)
        }
        setLocalStorage('addressList', addressList)
        setTimeout(() => {
          closeLoading()
          toast('保存成功')
          routerBack()
        }, 1000);
      }).catch((err: []) => {
        console.log(err);
      })
    }

    const handleDelete = () => {
      Dialog.confirm({
        title: '提示',
        message: '确定删除此地址？',
      }).then(() => {
        // on confirm
        toast('删除')
      }).catch(() => {
        // on cancel
      });
    }

    const initAddress = () => {
      if (selectAddress.value) form = selectAddress.value
    }
    initAddress()

    return () => (
      <div>
        <NavBar
          title="地址管理"
          left-text="返回"
          left-arrow
          onClick-left={routerBack}
        />
        <div class="mg10">
          <Form validate-first ref={vanForm}>
            <Field v-model={form.name} label="姓名" placeholder="请输入姓名" rules={[{ pattern: patterns.name, message: messages.name }]} />
            <Field v-model={form.tel} type="tel" label="手机号" placeholder="请输入手机号" maxlength={11} rules={[{ pattern: patterns.phone, message: messages.phone }]} />
            <Field
              readonly
              label="选择城市"
              rightIcon="arrow"
              modelValue={cityValue.value}
              placeholder="请选择城市"
              onClick={openCity}
              rules={[{ required: true, message: '请选择城市' }]}
            />
            <Field v-model={form.ads} label="详细地址" placeholder="请输入详细地址" rules={[{ pattern: patterns.ads, message: messages.ads }]} />
            <div class="mg10 mg-t20">
              <Button type="danger" round block onClick={onSubmit}>保存</Button>
              <Button round block onClick={handleDelete} style="margin-top:20px" v-show={selectAddress.value}>删除</Button>
            </div>
          </Form>
        </div>

        <CityPicker v-model={form.city} ref={cityPicker} />

      </div>
    )
  }
})