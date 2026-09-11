<script lang="ts">
  let {
    value = $bindable(''),
    label = 'Password',
    name = 'password',
    autocomplete = 'new-password',
    minlength = 12
  } = $props<{
    value?: string;
    label?: string;
    name?: string;
    autocomplete?: string;
    minlength?: number;
  }>();
  let visible = $state(false);
</script>

<div class="password-field">
  <label for={name}>{label}</label>
  <div class="password-row">
    <input
      id={name}
      {name}
      type={visible ? 'text' : 'password'}
      {autocomplete}
      bind:value
      required
      {minlength}
      maxlength="128"
    />
  </div>
  <label class="visibility"
    ><input type="checkbox" bind:checked={visible} /> Tampilkan {label.toLowerCase()}</label
  >
</div>

<style>
  .password-row {
    display: flex;
    gap: 8px;
    align-items: stretch;
  }
  input {
    min-width: 0;
    flex: 1;
  }
  .visibility {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    font-weight: normal;
    cursor: pointer;
  }
  .visibility input {
    width: 18px;
    height: 18px;
    flex: none;
    margin: 0;
  }
</style>
