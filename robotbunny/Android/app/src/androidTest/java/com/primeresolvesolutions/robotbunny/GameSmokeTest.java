package com.primeresolvesolutions.robotbunny;

import android.graphics.Bitmap;
import android.os.SystemClock;
import android.view.InputDevice;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import androidx.lifecycle.Lifecycle;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.junit.Test;
import org.junit.runner.RunWith;
import java.io.File;
import java.io.FileOutputStream;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.Assert.*;

@RunWith(AndroidJUnit4.class)
public class GameSmokeTest {
    private interface ActivityAction { void run(MainActivity activity); }
    private void onMain(ActivityScenario<MainActivity> scenario,ActivityAction action){
        // ActivityScenario.onActivity waits for an idle UI queue. A running game
        // renders continuously, so dispatch directly to the main thread instead.
        InstrumentationRegistry.getInstrumentation().runOnMainSync(()->{
            java.util.Collection<android.app.Activity> activities=androidx.test.runner.lifecycle.ActivityLifecycleMonitorRegistry.getInstance().getActivitiesInStage(androidx.test.runner.lifecycle.Stage.RESUMED);
            for(android.app.Activity activity:activities)if(activity instanceof MainActivity){action.run((MainActivity)activity);return;}
            throw new AssertionError("No resumed game activity");
        });
    }
    private void mark(String message){android.os.Bundle data=new android.os.Bundle();data.putString("stream","\nRBQA: "+message+"\n");InstrumentationRegistry.getInstrumentation().sendStatus(2,data);}
    private WebView web(View view) {
        if (view instanceof WebView) return (WebView)view;
        if (view instanceof ViewGroup) for(int i=0;i<((ViewGroup)view).getChildCount();i++) {
            WebView found=web(((ViewGroup)view).getChildAt(i)); if(found!=null)return found;
        }
        return null;
    }
    private String js(ActivityScenario<MainActivity> scenario,String script) throws Exception {
        CountDownLatch latch=new CountDownLatch(1);AtomicReference<String> result=new AtomicReference<>();
        onMain(scenario,a->web(a.getWindow().getDecorView()).evaluateJavascript(script,v->{result.set(v);latch.countDown();}));
        assertTrue(latch.await(10,TimeUnit.SECONDS));return result.get();
    }
    private void waitFor(ActivityScenario<MainActivity> scenario,String expression) throws Exception {
        long deadline=SystemClock.elapsedRealtime()+30000;
        while(SystemClock.elapsedRealtime()<deadline){if("true".equals(js(scenario,expression)))return;SystemClock.sleep(100);}
        fail("Not ready: "+expression+"; body="+js(scenario,"document.body.innerText.slice(0,300)"));
    }
    private JSONObject object(ActivityScenario<MainActivity> scenario,String expression) throws Exception {
        String encoded=js(scenario,"JSON.stringify("+expression+")");return new JSONObject((String)new JSONTokener(encoded).nextValue());
    }
    private float[] point(ActivityScenario<MainActivity> scenario,String selector,double x) throws Exception {
        JSONObject p=object(scenario,"(()=>{const r=document.querySelector("+JSONObject.quote(selector)+").getBoundingClientRect();return {x:(r.left+r.width*"+x+")*devicePixelRatio,y:(r.top+r.height/2)*devicePixelRatio}})()");
        return new float[]{(float)p.getDouble("x"),(float)p.getDouble("y")};
    }
    private void event(ActivityScenario<MainActivity> scenario,long down,int action,int[] ids,float[][] points) {
        MotionEvent.PointerProperties[] properties=new MotionEvent.PointerProperties[ids.length];
        MotionEvent.PointerCoords[] coords=new MotionEvent.PointerCoords[ids.length];
        for(int i=0;i<ids.length;i++){properties[i]=new MotionEvent.PointerProperties();properties[i].id=ids[i];properties[i].toolType=MotionEvent.TOOL_TYPE_FINGER;coords[i]=new MotionEvent.PointerCoords();coords[i].x=points[i][0];coords[i].y=points[i][1];coords[i].pressure=1;coords[i].size=1;}
        MotionEvent e=MotionEvent.obtain(down,SystemClock.uptimeMillis(),action,ids.length,properties,coords,0,0,1,1,0,0,InputDevice.SOURCE_TOUCHSCREEN,0);
        onMain(scenario,a->web(a.getWindow().getDecorView()).dispatchTouchEvent(e));e.recycle();SystemClock.sleep(60);
    }
    private void tap(ActivityScenario<MainActivity> scenario,String selector) throws Exception {
        float[] p=point(scenario,selector,.5);long down=SystemClock.uptimeMillis();event(scenario,down,MotionEvent.ACTION_DOWN,new int[]{0},new float[][]{p});event(scenario,down,MotionEvent.ACTION_UP,new int[]{0},new float[][]{p});
    }
    private void ready(ActivityScenario<MainActivity> scenario) throws Exception {
        waitFor(scenario,"document.readyState==='complete'&&!!document.getElementById('start-btn')&&!document.getElementById('start-btn').disabled&&document.getElementById('start-btn').textContent.includes('TAP TO START')");
    }
    private void screenshot(ActivityScenario<MainActivity> scenario,String name) throws Exception {
        CountDownLatch latch=new CountDownLatch(1);AtomicReference<Bitmap> result=new AtomicReference<>();
        java.util.concurrent.atomic.AtomicInteger code=new java.util.concurrent.atomic.AtomicInteger(-1);
        onMain(scenario,a->{
            View decor=a.getWindow().getDecorView();Bitmap bitmap=Bitmap.createBitmap(decor.getWidth(),decor.getHeight(),Bitmap.Config.ARGB_8888);result.set(bitmap);
            if(android.os.Build.VERSION.SDK_INT>=26)android.view.PixelCopy.request(a.getWindow(),bitmap,status->{code.set(status);latch.countDown();},new android.os.Handler(android.os.Looper.getMainLooper()));
            else{decor.draw(new android.graphics.Canvas(bitmap));code.set(0);latch.countDown();}
        });
        assertTrue("Screenshot callback",latch.await(10,TimeUnit.SECONDS));assertEquals("Screenshot captured",0,code.get());
        File dir=InstrumentationRegistry.getInstrumentation().getTargetContext().getExternalFilesDir(null);
        try(FileOutputStream out=new FileOutputStream(new File(dir,name+".png"))){assertTrue(result.get().compress(Bitmap.CompressFormat.PNG,100,out));result.get().recycle();}
    }

    @Test public void offlineGameplayMultiTouchAndLifecycle() throws Exception {
        try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
            ready(scenario);mark("ready");screenshot(scenario,"start-screen");mark("screenshot");tap(scenario,"#start-btn");mark("start tapped");waitFor(scenario,"document.getElementById('start-screen').classList.contains('hidden')");
            JSONObject size=object(scenario,"(()=>{const r=document.getElementById('game').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,vw:innerWidth,vh:innerHeight}})()");
            assertEquals(0,size.getDouble("x"),1);assertEquals(0,size.getDouble("y"),1);assertEquals(size.getDouble("vw"),size.getDouble("w"),1);assertEquals(size.getDouble("vh"),size.getDouble("h"),1);
            mark("jump and fire");tap(scenario,"#mobile-jump");tap(scenario,"#mobile-laser");
            SystemClock.sleep(500);
            js(scenario,"window.__inputEvents=[];for(const type of ['pointerdown','pointerup','pointercancel','lostpointercapture','rb:clear-input'])document.addEventListener(type,e=>__inputEvents.push({type,target:e.target.id,buttons:e.buttons,x:e.clientX,y:e.clientY}),true);true");
            float[] joystick=point(scenario,"#joystick-base",.93),fire=point(scenario,"#mobile-laser",.5);
            for(int cycle=0;cycle<10;cycle++){mark("touch cycle "+cycle);
                long down=SystemClock.uptimeMillis();event(scenario,down,MotionEvent.ACTION_DOWN,new int[]{0},new float[][]{joystick});
                event(scenario,down,MotionEvent.ACTION_POINTER_DOWN|(1<<MotionEvent.ACTION_POINTER_INDEX_SHIFT),new int[]{0,1},new float[][]{joystick,fire});
                assertEquals("Input events "+js(scenario,"JSON.stringify(__inputEvents)"),"true",js(scenario,"document.getElementById('joystick-knob').style.transform.includes('calc')"));
                event(scenario,down,MotionEvent.ACTION_POINTER_UP,new int[]{0,1},new float[][]{joystick,fire});
                assertEquals("\"translate(-50%, -50%)\"",js(scenario,"document.getElementById('joystick-knob').style.transform"));
                event(scenario,down,MotionEvent.ACTION_UP,new int[]{1},new float[][]{fire});
            }
            mark("touches complete");screenshot(scenario,"original-gameplay");mark("game screenshot");
            onMain(scenario,a->a.onBackPressed());
            waitFor(scenario,"!document.getElementById('rb-pause-panel').hidden");tap(scenario,"#rb-resume");
            mark("backgrounding");scenario.moveToState(Lifecycle.State.CREATED);SystemClock.sleep(200);scenario.moveToState(Lifecycle.State.RESUMED);
            waitFor(scenario,"!document.getElementById('rb-pause-panel').hidden");
            assertEquals("true",js(scenario,"[...document.querySelectorAll('audio,video')].every(a=>a.paused)"));tap(scenario,"#rb-resume");
            js(scenario,"localStorage.setItem('__robotAndroidQA','saved');localStorage.setItem('rb_upg_magnet','2');true");
            js(scenario,"document.getElementById('rb-pause').click();true");mark("recreate");scenario.recreate();ready(scenario);mark("recreated");assertEquals("\"saved\"",js(scenario,"localStorage.getItem('__robotAndroidQA')"));assertEquals("\"2\"",js(scenario,"localStorage.getItem('rb_upg_magnet')"));
            js(scenario,"localStorage.removeItem('__robotAndroidQA');true");
        }
    }
    @Test public void alternateEditionAndBack() throws Exception {
        try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
            ready(scenario);SystemClock.sleep(500);tap(scenario,"a[href*=\"engine/\"]");
            waitFor(scenario,"location.pathname.includes('/engine/')&&!!document.getElementById('play')&&!document.getElementById('play').disabled");
            tap(scenario,"#play");tap(scenario,"[data-control=jump]");tap(scenario,"[data-control=shoot]");screenshot(scenario,"alternate-gameplay");
            onMain(scenario,a->a.onBackPressed());ready(scenario);
        }
    }
    @Test public void localOnlyAndErrorRecovery() throws Exception {
        assertTrue(MainActivity.isLocal(android.net.Uri.parse(MainActivity.HOME)));
        assertFalse(MainActivity.isLocal(android.net.Uri.parse("https://example.com/assets/www/index.html")));
        assertFalse(MainActivity.isLocal(android.net.Uri.parse("file:///sdcard/index.html")));
        assertFalse(MainActivity.isLocal(android.net.Uri.parse("https://appassets.androidplatform.net/assets/www/%2e%2e/secret")));
        try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
            ready(scenario);
            js(scenario,"window.__networkTest='pending';fetch('https://example.com/').then(r=>__networkTest=r.status).catch(()=>__networkTest='blocked');true");
            waitFor(scenario,"window.__networkTest==='blocked'||window.__networkTest===403");
            onMain(scenario,a->web(a.getWindow().getDecorView()).loadUrl(MainActivity.HOME+"missing.html"));
            long end=SystemClock.elapsedRealtime()+10000;
            java.util.concurrent.atomic.AtomicBoolean shown=new java.util.concurrent.atomic.AtomicBoolean(false);
            do {
                onMain(scenario,a->{java.util.ArrayList<View> matches=new java.util.ArrayList<>();a.getWindow().getDecorView().findViewsWithText(matches,"Reload game",View.FIND_VIEWS_WITH_TEXT);shown.set(!matches.isEmpty());});
                if(!shown.get())SystemClock.sleep(100);
            }while(!shown.get()&&SystemClock.elapsedRealtime()<end);
            assertTrue("Native reload control visible",shown.get());
            onMain(scenario,a->a.onBackPressed());ready(scenario);
        }
    }
}
