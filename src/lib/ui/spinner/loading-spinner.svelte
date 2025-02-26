<script lang="ts">
	import { Circle2 } from "svelte-loading-spinners";
</script>


<div class="loading-spinner-wrapper">
    <div class="loading-spinner-content">
        <Circle2 size="60" unit="px"
            colorOuter="hsl(221.2 83.2% 53.3%)"
            colorCenter="hsl(221.2 83.2% 53.3%)"
            colorInner="hsl(221.2 83.2% 53.3%)" />
        <div class="loading-spinner-text">
            <slot name="loading-text" />
        </div>
    </div>
</div>