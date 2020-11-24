
/*
1.before mutation阶段（执行DOM操作前）
2.mutation阶段（执行DOM操作）
3.layout阶段（执行DOM操作后）
*/
export default function commitRoot(root) {
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

