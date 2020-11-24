function commitBeforeMutationEffects() {

}

/*
遍历effectList,对每个fiber节点执行三个操作

1.根据ContentReset effectTag重置文字节点
2.更新ref
3.根据effectTag分别处理，其中effectTag包括(Placement | Update | Deletion )
*/
function commitMutationEffects() {

}


/*
总共做两件事

1.commitLayoutEffectOnFiber（调用生命周期钩子和hook相关操作）

2.commitAttachRef（赋值 ref）

*/
function commitLayoutEffects() { }

/*
1.before mutation阶段（执行DOM操作前）
2.mutation阶段（执行DOM操作）
3.layout阶段（执行DOM操作后）
*/
function commitRoot(root) {
    const finishedWork = root.finishedWork;
    //console.log('root.containerInfo',finishedWork)
    root.containerInfo.innerHTML="";
    root.containerInfo.appendChild(finishedWork.child.child.stateNode)

    // commitBeforeMutationEffects(finishedWork);

    // do {
    //     try {
    //         commitMutationEffects(root, renderPriorityLevel);
    //     } catch (error) {
    //         invariant(nextEffect !== null, 'Should be working on an effect.');
    //         captureCommitPhaseError(nextEffect, error);
    //         nextEffect = nextEffect.nextEffect;
    //     }
    // } while (nextEffect !== null);


    // do {
    //     try {
    //         commitLayoutEffects(root, lanes);
    //     } catch (error) {
    //         invariant(nextEffect !== null, "Should be working on an effect.");
    //         captureCommitPhaseError(nextEffect, error);
    //         nextEffect = nextEffect.nextEffect;
    //     }
    // } while (nextEffect !== null);



    //current Fiber树切换
    root.current = finishedWork;
    //console.log('root.current: ', root.current.child.child.child.sibling.child.sibling);

    


}


export default commitRoot

