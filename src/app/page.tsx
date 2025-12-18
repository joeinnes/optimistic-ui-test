"use client";

import { Count, JazzAccount } from "@/schema";
import { slowReq } from "@/serverApi";
import { co, Group, ID } from "jazz-tools";
import { useSuspenseAccount, useSuspenseCoState } from "jazz-tools/react";
import { useMemo, useRef, useState } from "react";

export default function Home() {
  const group = useMemo(() => co.group().create(), []);
  // We have to use suspense here because we want to reference the returned value from this hook to set up the subscriptions in the following hooks,
  const me = useSuspenseAccount(JazzAccount, {
    resolve: {
      root: {
        count: true,
      },
    },
  });

  const mainBranch = useSuspenseCoState(Count, me.root.count.$jazz.id);
  const optimisticBranch = useSuspenseCoState(Count, me.root.count.$jazz.id, {
    unstable_branch: {
      name: "optimistic-branch",
      owner: group,
    },
  });
  const [clickCount, setClickCount] = useState<number>(0);
  const [failCount, setFailCount] = useState<number>(0);
  const [inFlightCount, setInFlightCount] = useState<number>(0);
  const inFlightRef = useRef(0);
  const latestAuthoritativeState = useRef(mainBranch);

  const handleCountIncrease = async () => {
    setClickCount((prev) => prev + 1);
    if (optimisticBranch.$isLoaded && mainBranch.$isLoaded) {
      try {
        optimisticBranch.$jazz.set("count", optimisticBranch.count + 1);
        inFlightRef.current += 1;
        setInFlightCount(inFlightRef.current);

        const { count } = await slowReq.send({
          updateCountMessage: {
            type: "updateCount",
            id: me.root.count.$jazz.id,
          },
        });

        latestAuthoritativeState.current = count;
      } catch (err) {
        setFailCount((prev) => prev + 1);
      } finally {
        inFlightRef.current -= 1;
        setInFlightCount(inFlightRef.current);

        if (inFlightRef.current === 0) {
          const finalValue =
            latestAuthoritativeState.current?.count ?? mainBranch.count;
          optimisticBranch.$jazz.set("count", finalValue);

          latestAuthoritativeState.current = mainBranch;
        }
      }
    }
  };
  if (!optimisticBranch.$isLoaded || !mainBranch.$isLoaded) return null;
  const reset = () => {
    optimisticBranch.$jazz.set("count", 0);
    mainBranch.$jazz.set("count", 0);
    setClickCount(0);
    setFailCount(0);
    setInFlightCount(0);
  };
  return (
    <>
      <div>
        <h1>Demo</h1>
        <hgroup>
          <h2>{optimisticBranch.count}</h2> (optimistic)
          <h3>{mainBranch.count}</h3> (authoritative—main branch)
        </hgroup>
        <p>
          Each request has a 20% chance of failing. API will delay responses by
          2 seconds. Tap 'Add' to increase the count, and optimistically update
          the UI. Tap 'Reset' to reset the count to zero (wait until all
          in-flight requests are complete).
        </p>
        <div role="group">
          <button onClick={handleCountIncrease}>Add</button>
          <button onClick={reset} type="reset">
            Reset
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Clicks</th>
              <th>Errors from API</th>
              <th>Authoritative count</th>
              <th>Optimistic branch count</th>
              <th>In-flight</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{clickCount}</td>
              <td>{failCount}</td>
              <td>{mainBranch.count}</td>
              <td>{optimisticBranch.count}</td>
              <td>{inFlightCount}</td>
            </tr>
          </tbody>
        </table>
        <h3>To Solve</h3>
        <ul>
          <li>
            Ideally I would *discard* the branch and recheck-out the main
            branch. I don't think I can do that without throwing away the
            component though, which would lead to jank, so as it stands, I'm
            just updating the optimistic branch from the main branch, even
            though technically it's a different history.
          </li>
          <li>
            Currently, all updates are ignored if there are in-flight updates.
            This isn't my favourite way to solve this problem, but I can't see a
            better way.
          </li>
        </ul>
        <h3>Observations</h3>
        <ul>
          <li>
            I've implemented this using suspense here, but it would work equally
            with a wrapper component.
          </li>
        </ul>
        <a href="https://github.com/joeinnes/optimistic-ui-test">Source</a>
      </div>
    </>
  );
}
