import React, {Component} from "react";
import {WithRouterProps} from "next/dist/client/with-router";
import {withRouter} from "next/router";

import AGButton from "../../../components/common/ag-button.component";
import { IsNotLogIn} from "../../../utils/firebase.util";
import {PageLocation} from "../../../enums/common.enum";

import AvatarGenerator, { 
  getServerSideProps as serverProps,
  AvatarGeneratorProps
} from "../../index"

interface BulkExportProps extends WithRouterProps, AvatarGeneratorProps {
  campaigns: string[];
}

interface BulkExportState {
  exportRunning: boolean;
  totalIterations: number;
  iterationStarts: number;
  iterationEnds: number;
  logs: string;
}



/**
 * HOC to intercept Avatar preview exporter from Admin view
 * To access the Avatar Module, you can use the member variable `this.ref`
 * and use its methods and variables
 * 
 * @param AvatarComp 
 * @returns
 */
function withAdminExporter(AvatarComp: typeof AvatarGenerator) {
  return withRouter(class AdminExporter extends Component<BulkExportProps, BulkExportState>  {
    // identify all parts base on feature types
    parts: Map<string, any[]> = new Map()
    // features are the mesh section where a part can be attached
    features: { type: string, id: string }[] = []
    // Saving all combination index to export
    // and make sure they are unique
    permutationPool: Set<number[]> = new Set()
    // Avatar component reference
    private ref: React.RefObject<AvatarGenerator>

    constructor(props: BulkExportProps) {
      super(props);
      this.state = {
        exportRunning: false,
        totalIterations: 0,
        iterationStarts: 0,
        iterationEnds: 0,
        logs: 'logs ==============\n',
      }
      this.ref = React.createRef()
    }
  
    async componentDidMount() {
      const avatarGenerator = this.ref.current as AvatarGenerator 
      if(await IsNotLogIn())
        await this.props.router.push(PageLocation.Admin);

      // set the avatar generator page in export/viewport mode by default
      avatarGenerator.changeView()
    }

    log(text: string) {
      const logText = this.state.logs
      this.setState({ logs: logText + text + '\n' })
    }

    /**
     * trigger process to export all different combination meshes
     */
    async onExportAll() {
      this.setState({ exportRunning: true })
      this.log("Generating permutations...")
      await this.generatePermutations()
      console.time("export time")
      this.log("Starting downloads...")
      for await(const comb of this.downloadCombination()) {
        this.log(`permutation downloaded for ${comb}`)
      }
      this.log(`Downloads finished`)
      console.timeLog("export time")
      this.setState({ exportRunning: false })
    }

    async onStopProcess() {
      this.setState({ exportRunning: false })
    }

    /**
     * Download one combination with unique traits
     */
    async *downloadCombination() {
      const { iterationStarts, iterationEnds } = this.state
      const permutations = Array
        .from(this.permutationPool)
        .slice(iterationStarts, iterationEnds)
      this.log(`Amount of permutations to download ${permutations.length}`)
      for(let itr = 0; itr < permutations.length; itr++) {
        const comb = permutations[itr]
        await this.setCombinationByIndexes(comb)
        await this.ref.current?.exportModel()
        
        yield comb.join(" - ")

        if(!this.state.exportRunning) {
          break
        }
      }
    }

    /**
     * Generate all permutations
     * @returns 
     */
    async generatePermutations() {
      const arr = Array.from(this.parts)
        .map(([_, items]) => items)
        .map(items => items.map(it => it.index))
      const featuresLength = this.features.length
      const indices = new Array(featuresLength).fill(0)
      const iterationLimit = this.getTotalIteration();
      let iteration = 0;

      while(iteration < iterationLimit) {
        iteration++

        let indicesArr: number[] = []
        for(let i = 0; i < featuresLength; i++) {
          const index = arr[i][indices[i]] as number
          indicesArr.push(index)
        }
        this.permutationPool.add(indicesArr)

        let next = featuresLength - 1
        while(next >= 0 && (indices[next] + 1 >= arr[next].length)) {
          next--
        }

        if(next < 0) return
        indices[next]++

        for(let itr = next + 1; itr < featuresLength; itr++) {
          indices[itr] = 0
        }
      }
    }

    /**
     * 
     * @param partIndexes 
     */
    async setCombinationByIndexes(partIndexes: number[]) {
      const avatarGenerator = this.ref.current
      for(let itr = 0; itr < this.features.length; itr++) {
        const feature = this.features[itr]
        const partIndex = partIndexes[itr]
        const partsByType = this.parts.get(feature.type) || []
        const part = partsByType[partIndex]
        await avatarGenerator?.changePart(
          part.id,
          part.path,
          part.name,
          part.type
        )
      }

      console.log('combination done')
    }

    /**
     * Set the first mesh combination based on index values for each part
     * mesh combination 0-0-0-0 where each digit is a feature
     * and the value of the feature represents the index for the feature part
     */
    setInitialCombination() {
      const partIndexes = new Array(this.features.length).fill(0)
      this.setCombinationByIndexes(partIndexes)
    }

    /**
     * 
     */
    parseAvatarData() {
      const avatarGenerator = this.ref.current;
      this.features = Object.entries(avatarGenerator?.partListData || {})
        .map(([type]) => ({
          type,
          id: type,
          offset: 0,
        }))
        .sort((partA, partB) => partA.id > partB.id ? 1 : -1);
      
      this.features.forEach((feature) => {
        const { type } = feature
        const partList = avatarGenerator?.partList || []
        const partsByType = partList
          .filter((part) =>
            part.type === type
          )
          .sort((partA, partB) => partA.index > partB.index ? 1 : -1)
        this.parts.set(type, partsByType)
      });

      const totalComb = this.getTotalIteration()
      this.setInitialCombination();
      this.setState({ iterationEnds: totalComb, totalIterations: totalComb })
    }

    /**
     * Gets how many iterations take to pass over all combinations
     * this number is based on the amounts of parts in each feature type
     * i.e.
     *      parts grouped by features = [ 10, 5, 3, 7 ]
     *      total iterations = 10 * 5 * 3 * 7
     * @returns - total iterations
     */
    getTotalIteration(): number {
      let recursionNumber = 1
      this.parts.forEach((partsByType) => recursionNumber *= partsByType.length)
      return recursionNumber;
    }

    render() {
      return (
        <>
          <div 
            className="flex flex-row fixed inset-x-0 bottom-0 p-1.5 w-10/12 bg-gray-700 overflow-hidden text-slate-300"
            style={{
              zIndex: 9999,
              height: 150,
            }}
          >
            <div className="w-4/12 font-mono">
              <div>
                <h3>Export all combination meshes</h3>
                <div className="flex py-1">
                  <div className="w-6/12">Iteration starts at:</div>
                  <div className="w-3/12">
                    <input
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg bg-slate-300 px-2"
                      type="number"
                      placeholder="0"
                      value={this.state.iterationStarts}
                      onChange={({ target }) => this.setState({iterationStarts: Number(target.value)})}
                    />
                  </div>
                </div>
                <div className="flex py-1">
                  <div className="w-6/12">Iteration ends at:</div>
                  <div className="w-3/12">
                    <input
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg bg-slate-300 px-2"
                      placeholder={String(this.state.totalIterations)}
                      type="number"
                      value={this.state.iterationEnds}
                      onChange={({ target }) => this.setState({iterationEnds: Number(target.value)})}
                    />
                  </div>
                </div>
              </div>
              <div>
                {
                  this.state.exportRunning
                  ? (
                    <AGButton type="alert" onClickEvent={() => this.onStopProcess()}>
                      Stop
                    </AGButton>
                  )
                  : (
                    <AGButton type="secondary" onClickEvent={() => this.onExportAll()}>
                      Export All
                    </AGButton>
                  )
                }
              </div>
            </div>
            <div className="w-8/12 font-mono overflow-x-auto">
              <pre>
                {this.state.logs}
              </pre>
            </div>
          </div>
          <AvatarComp
            ref={this.ref}
            onDataLoaded={() => this.parseAvatarData()}
            {...this.props}
          />
        </>
      )
    }
    
  })
}

export default withAdminExporter(AvatarGenerator)
export const getServerSideProps = serverProps
